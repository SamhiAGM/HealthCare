import express from 'express';
import { QueueToken } from '../models/QueueToken';
import { Appointment } from '../models/Appointment';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';
import { eventBus, EVENTS } from '../events/eventBus';

const router = express.Router();

// GET /api/v1/queue/live/:hospitalId/:departmentId
// Publicly accessible to view live queue status (for the tracker)
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

    // Get tokens that are currently active or completed today
    const tokens = await QueueToken.find(filter).sort({ displayOrder: 1 });

    const currentlyServing = tokens.find(t => t.status === 'In-Consultation' || t.status === 'Called');
    const waitingList = tokens.filter(t => t.status === 'Waiting');

    res.json({ 
      success: true, 
      data: {
        totalTokens: tokens.length,
        currentlyServing: currentlyServing ? currentlyServing.tokenNumber : null,
        waitingCount: waitingList.length,
        estimatedWaitTime: waitingList.length * 5 // Rough estimate 5 mins per patient
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching live queue' });
  }
});

// POST /api/v1/queue/checkin - Citizen scans QR to check-in
const checkInSchema = z.object({
  appointmentNumber: z.string(),
  qrCode: z.string()
});

router.post('/checkin', authenticate, validateBody(checkInSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN' && req.user?.role !== 'RECEPTION') {
      return res.status(403).json({ success: false, message: 'Unauthorized to perform check-in' });
    }
    const { appointmentNumber, qrCode } = req.body;

    let appointment;
    if (req.user?.role === 'RECEPTION') {
      appointment = await Appointment.findOne({ appointmentNumber });
    } else {
      appointment = await Appointment.findOne({ appointmentNumber, qrCode });
    }
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Invalid appointment details' });
    }

    if (appointment.status !== 'Confirmed') {
      return res.status(400).json({ success: false, message: `Appointment is ${appointment.status}` });
    }

    // Check if token already exists for today
    const startOfDay = new Date(new Date().setHours(0,0,0,0));
    const existingToken = await QueueToken.findOne({ appointmentId: appointment._id, date: { $gte: startOfDay } });
    if (existingToken) {
      return res.status(400).json({ success: false, message: 'Already checked in', data: existingToken });
    }

    // Generate queue token number
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
      status: 'Waiting',
      checkedInAt: new Date()
    });

    await token.save();
    
    // Update appointment status
    appointment.status = 'Arrived';
    await appointment.save();

    eventBus.emit(EVENTS.PATIENT_CHECKED_IN, {
      appointmentId: appointment._id,
      hospitalId: appointment.hospitalId,
      clinicId: appointment.clinicId,
      queueTokenId: token._id,
      tokenNumber: tokenNumber
    });

    res.status(201).json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error checking in' });
  }
});

// POST /api/v1/queue/:id/advance - Admin calls next patient
const advanceSchema = z.object({
  action: z.enum(['Call', 'Start-Consultation', 'Complete', 'No-Show'])
});

router.post('/:id/advance', authenticate, validateBody(advanceSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Check if user is hospital staff...
    if (req.user?.role === 'CITIZEN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const token = await QueueToken.findById(req.params.id);
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

    const { action } = req.body;

    switch (action) {
      case 'Call':
        token.status = 'Called';
        token.calledAt = new Date();
        break;
      case 'Start-Consultation':
        token.status = 'In-Consultation';
        token.consultationStartAt = new Date();
        break;
      case 'Complete':
        token.status = 'Completed';
        token.completedAt = new Date();
        if (token.appointmentId) {
          await Appointment.findByIdAndUpdate(token.appointmentId, { status: 'Completed' });
        }
        break;
      case 'No-Show':
        token.status = 'Missed';
        if (token.appointmentId) {
          await Appointment.findByIdAndUpdate(token.appointmentId, { status: 'NoShow' });
        }
        break;
    }

    await token.save();
    res.json({ success: true, data: token });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error advancing queue' });
  }
});

export default router;
