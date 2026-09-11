import express, { Response } from 'express';
import { QueueToken } from '../models/QueueToken';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/queues - List queues for hospital
router.get('/', authenticate, requirePermission('opd.manage'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { departmentId, date, status } = req.query;
    
    const filter: any = { hospitalId };
    if (departmentId) filter.departmentId = departmentId;
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['Waiting', 'Approaching', 'Called', 'In-Consultation'] };
    }
    
    if (date) {
      const queryDate = new Date(date as string);
      const startOfDay = new Date(queryDate.setHours(0,0,0,0));
      const endOfDay = new Date(queryDate.setHours(23,59,59,999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0,0,0,0));
      const endOfDay = new Date(today.setHours(23,59,59,999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const tokens = await QueueToken.find(filter)
      .populate('departmentId', 'name')
      .populate('citizenId', 'name nic')
      .sort({ displayOrder: 1 });

    res.json({ success: true, count: tokens.length, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching queues' });
  }
});

// PATCH /api/v1/queues/:id/status - Update queue status
const updateStatusSchema = z.object({
  status: z.enum(['Waiting', 'Approaching', 'Called', 'In-Consultation', 'Completed', 'Missed', 'Cancelled']),
});

router.patch('/:id/status', authenticate, requirePermission('opd.manage'), requireHospitalScope, validateBody(updateStatusSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { status } = req.body;
    
    const token = await QueueToken.findOne({ _id: req.params.id, hospitalId });
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    token.status = status;
    if (status === 'Called') token.calledAt = new Date();
    if (status === 'In-Consultation') token.consultationStartAt = new Date();
    if (status === 'Completed') token.completedAt = new Date();

    await token.save();
    
    // In a real system, we would broadcast via WebSockets here

    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// POST /api/v1/queues/generate - Generate ad-hoc token (Walk-in patient)
const generateTokenSchema = z.object({
  departmentId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid department ID'),
});

router.post('/generate', authenticate, requirePermission('opd.manage'), requireHospitalScope, validateBody(generateTokenSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { departmentId } = req.body;
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay = new Date(today.setHours(23,59,59,999));
    
    const lastToken = await QueueToken.findOne({
      hospitalId,
      departmentId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ displayOrder: -1 });

    const nextOrder = lastToken ? lastToken.displayOrder + 1 : 1;
    const prefix = 'W'; // Walk-in
    const tokenNumber = `${prefix}${nextOrder.toString().padStart(3, '0')}`;

    const token = new QueueToken({
      hospitalId,
      departmentId,
      tokenNumber,
      displayOrder: nextOrder,
      date: new Date(),
      status: 'Waiting',
      checkedInAt: new Date()
    });

    await token.save();

    res.status(201).json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error generating token' });
  }
});

export default router;
