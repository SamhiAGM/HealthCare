import express from 'express';
import { Doctor } from '../models/Doctor';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/doctors - Public route to list doctors
router.get('/', async (req, res) => {
  try {
    const { hospitalId, departmentId, search } = req.query;
    const filter: any = { isActive: true };
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (departmentId) filter.departmentId = departmentId;
    
    // We would typically join with User collection to search by name
    // For now, simple return
    const doctors = await Doctor.find(filter)
      .populate('userId', 'firstName lastName email mobile')
      .populate('hospitalId', 'name district')
      .populate('departmentId', 'name');

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    console.error('Fetch doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching doctors' });
  }
});

// GET /api/v1/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'firstName lastName email mobile')
      .populate('hospitalId', 'name district')
      .populate('departmentId', 'name');
      
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/doctors - Create a doctor profile (Admin only)
const createDoctorSchema = z.object({
  userId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid user ID'),
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  departmentId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid department ID'),
  licenseNumber: z.string(),
  specialties: z.array(z.string()),
  qualifications: z.array(z.string()),
  title: z.string(),
});

router.post('/', authenticate, validateBody(createDoctorSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Only HospitalStaff or SystemAdmin can do this...
    const doctor = new Doctor(req.body);
    await doctor.save();
    
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating doctor profile' });
  }
});

export default router;
