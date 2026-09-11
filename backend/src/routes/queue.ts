import express from 'express';
import { QueueToken } from '../models/QueueToken';
import { Appointment } from '../models/Appointment';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { eventBus, EVENTS } from '../events/eventBus';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/queue/live/:hospitalId/:departmentId
router.get(['/live/:hospitalId', '/live/:hospitalId/:departmentId'], async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const departmentId = (req.params as any).departmentId;
    const filter: any = { 
      hospitalId, 
      date: { 
        $gte: new Date(new Date().setHours(0,0,0,0)), 
        $lt: new Date(new Date().setHours(23,59,59,999)) 
      } 
    };
    if (departmentId) filter.departmentId = departmentId;

    const tokens = await QueueToken.find(filter).sort({ displayOrder: 1 });
    
    // Convert old statuses if they exist in legacy data to new strict ones
    const activeTokens = tokens.filter(t => ['Waiting', 'WAITING', 'Called', 'CALLED', 'In-Consultation', 'IN_CONSULTATION', 'RECALLED', 'TEMPORARILY_SKIPPED'].includes(t.status));
    const waitingList = tokens.filter(t => t.status === 'Waiting' || t.status === 'WAITING' || t.status === 'TEMPORARILY_SKIPPED');

    res.json({ 
      success: true, 
      data: {
        totalTokens: activeTokens.length,
        waitingCount: waitingList.length,
        estimatedWaitTime: waitingList.length * 5,
        tokens: activeTokens
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching live queue' });
  }
});

// POST /api/v1/queue/checkin
const checkInSchema = z.object({
  appointmentNumber: z.string(),
  qrCode: z.string().optional()
});

router.post('/checkin', authenticate, validateBody(checkInSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['CITIZEN', 'RECEPTION_STAFF'].includes(req.user?.role || '')) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const { appointmentNumber } = req.body;
    const appointment = await Appointment.findOne({ appointmentNumber });
    
    if (!appointment) return res.status(404).json({ success: false, message: 'Invalid appointment' });

    const startOfDay = new Date(new Date().setHours(0,0,0,0));
    const existingToken = await QueueToken.findOne({ appointmentId: appointment._id, date: { $gte: startOfDay } });
    if (existingToken) return res.status(400).json({ success: false, message: 'Already checked in' });

    const countToday = await QueueToken.countDocuments({ 
      hospitalId: appointment.hospitalId,
      departmentId: appointment.departmentId,
      date: { $gte: startOfDay }
    });

    const displayOrder = countToday + 1;
    const prefix = appointment.clinicId ? 'C' : 'G';
    const tokenNumber = `${prefix}-${displayOrder.toString().padStart(3, '0')}`;

    const token = new QueueToken({
      hospitalId: appointment.hospitalId,
      departmentId: appointment.departmentId,
      appointmentId: appointment._id,
      citizenId: appointment.citizenId,
      tokenNumber,
      displayOrder,
      date: new Date(),
      status: 'WAITING',
      checkedInAt: new Date()
    });

    await token.save();
    
    appointment.status = 'Arrived';
    await appointment.save();

    eventBus.emit(EVENTS.PATIENT_CHECKED_IN, { token });
    res.status(201).json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/queue/call-next
// ATOMIC Call Next Patient
const callNextSchema = z.object({
  clinicId: z.string().optional(),
  departmentId: z.string()
});

router.post('/call-next', authenticate, validateBody(callNextSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'DOCTOR') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { departmentId } = req.body;
    const startOfDay = new Date(new Date().setHours(0,0,0,0));

    // ATOMIC LOCK: Find the first WAITING patient and set them to CALLED in one database operation
    const nextPatient = await QueueToken.findOneAndUpdate(
      { 
        departmentId, 
        date: { $gte: startOfDay }, 
        status: { $in: ['WAITING', 'Waiting'] } 
      },
      { 
        $set: { 
          status: 'CALLED', 
          calledAt: new Date(),
          doctorId: req.user.id
        } 
      },
      { sort: { displayOrder: 1 }, new: true } // Return the updated document
    );

    if (!nextPatient) {
      return res.status(404).json({ success: false, message: 'No eligible patients waiting in queue' });
    }

    eventBus.emit('QUEUE_TOKEN_CALLED', { token: nextPatient, doctorId: req.user.id });
    res.json({ success: true, data: nextPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error calling next patient' });
  }
});

// POST /api/v1/queue/:id/recall
router.post('/:id/recall', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const token = await QueueToken.findOneAndUpdate(
      { _id: req.params.id, status: 'CALLED' },
      { $inc: { recallCount: 1 } },
      { new: true }
    );
    if (!token) return res.status(404).json({ success: false, message: 'Token not found or not in CALLED state' });
    
    eventBus.emit('QUEUE_TOKEN_RECALLED', { token });
    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/queue/:id/no-response
router.post('/:id/no-response', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const token = await QueueToken.findOneAndUpdate(
      { _id: req.params.id, status: 'CALLED' },
      { $set: { status: 'NO_RESPONSE' } },
      { new: true }
    );
    if (!token) return res.status(404).json({ success: false, message: 'Token not found or not CALLED' });
    
    eventBus.emit('QUEUE_TOKEN_NO_RESPONSE', { token });
    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/queue/:id/skip
router.post('/:id/skip', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const token = await QueueToken.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'TEMPORARILY_SKIPPED' } },
      { new: true }
    );
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
    
    eventBus.emit('QUEUE_TOKEN_SKIPPED', { token });
    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/queue/:id/complete
router.post('/:id/complete', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const token = await QueueToken.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'COMPLETED', completedAt: new Date() } },
      { new: true }
    );
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
    
    if (token.appointmentId) {
      await Appointment.findByIdAndUpdate(token.appointmentId, { status: 'Completed' });
    }
    
    eventBus.emit('QUEUE_TOKEN_COMPLETED', { token });
    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
