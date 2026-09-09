import express from 'express';
import { Clinic } from '../models/Clinic';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/clinics - Get all clinics (public or filtered by hospital)
router.get('/', async (req, res) => {
  try {
    const { hospitalId, day, status } = req.query;
    const filter: any = {};
    if (hospitalId) filter.hospitalId = hospitalId;
    if (day) filter.day = day;
    if (status) filter.status = status;

    const clinics = await Clinic.find(filter)
      .populate('hospitalId', 'name district category')
      .populate('doctorId', 'user title specialties')
      .sort({ day: 1, startTime: 1 });

    res.json({ success: true, count: clinics.length, data: clinics });
  } catch (error) {
    console.error('Fetch clinics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching clinics' });
  }
});

// POST /api/v1/clinics - Create a new clinic (Admin/Hospital only)
const createClinicSchema = z.object({
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  name: z.string().min(2),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  capacity: z.number().int().positive().optional(),
  bookingOpen: z.boolean().optional(),
});

router.post('/', authenticate, validateBody(createClinicSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Basic authorization check could go here based on user role
    const clinic = new Clinic(req.body);
    await clinic.save();
    
    res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    console.error('Create clinic error:', error);
    res.status(500).json({ success: false, message: 'Server error creating clinic' });
  }
});

export default router;
