import express, { Response } from 'express';
import { Doctor } from '../models/Doctor';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/doctors - Public route to list doctors
router.get('/', async (req, res) => {
  try {
    const { hospitalId, departmentId, search } = req.query;
    const filter: any = { active: true };
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (departmentId) filter.departmentId = departmentId;
    if (search) filter.$text = { $search: String(search) };
    
    const doctors = await Doctor.find(filter)
      .populate('hospitalId', 'officialName district')
      .populate('departmentId', 'name');

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching doctors' });
  }
});

// GET /api/v1/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('hospitalId', 'officialName district')
      .populate('departmentId', 'name');
      
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/doctors - Create a doctor profile (Admin only)
const createDoctorSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  specialty: z.string(),
  subSpecialty: z.string().optional(),
  departmentId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid department ID').optional(),
});

router.post('/', authenticate, requirePermission('staff.manage'), requireHospitalScope, validateBody(createDoctorSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    if (!hospitalId) return res.status(400).json({ error: 'Hospital ID required' });

    const doctor = new Doctor({ ...req.body, hospitalId });
    await doctor.save();
    
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating doctor profile' });
  }
});

// PATCH /api/v1/doctors/:id - Update doctor
router.patch('/:id', authenticate, requirePermission('staff.manage'), requireHospitalScope, validateBody(createDoctorSchema.partial()), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user?.hospitalId },
      req.body,
      { new: true }
    );
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating doctor profile' });
  }
});

export default router;
