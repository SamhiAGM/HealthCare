import express, { Response } from 'express';
import { Admission } from '../models/Admission';
import { BedInventory } from '../models/BedInventory';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/admissions - List hospital admissions
router.get('/', authenticate, requirePermission('clinical.view'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { status, wardId } = req.query;
    
    const filter: any = { hospitalId };
    if (status) filter.status = status;
    if (wardId) filter.wardId = wardId;

    const admissions = await Admission.find(filter)
      .populate('citizenId', 'name nic dateOfBirth')
      .populate('doctorId', 'name title')
      .populate('departmentId', 'name')
      .populate('wardId', 'wardType')
      .sort({ admissionDate: -1 });

    res.json({ success: true, count: admissions.length, data: admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching admissions' });
  }
});

// POST /api/v1/admissions - Admit a patient
const admitSchema = z.object({
  citizenId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid citizen ID'),
  doctorId: z.string().optional(),
  departmentId: z.string().optional(),
  wardId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid ward ID'),
  diagnosis: z.string().optional(),
  notes: z.string().optional()
});

router.post('/', authenticate, requirePermission('clinical.manage'), requireHospitalScope, validateBody(admitSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { citizenId, doctorId, departmentId, wardId, diagnosis, notes } = req.body;
    
    // Check if bed is available in the selected ward
    const ward = await BedInventory.findOne({ _id: wardId, hospitalId });
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }
    
    if (ward.available <= 0) {
      return res.status(400).json({ success: false, message: 'No beds available in this ward' });
    }

    // Check if patient is already admitted
    const existing = await Admission.findOne({ citizenId, status: 'Admitted' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Patient is already admitted' });
    }

    const admission = new Admission({
      hospitalId, citizenId, doctorId, departmentId, wardId, diagnosis, notes
    });
    await admission.save();

    // Update bed inventory
    ward.occupied += 1;
    ward.available = ward.total - ward.occupied;
    
    const occupancyRate = ward.occupied / ward.total;
    if (occupancyRate >= 1) ward.publicStatus = 'Full';
    else if (occupancyRate >= 0.9) ward.publicStatus = 'Critical';
    else if (occupancyRate >= 0.75) ward.publicStatus = 'Limited';
    else ward.publicStatus = 'Available';

    await ward.save();

    res.status(201).json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error admitting patient' });
  }
});

// PATCH /api/v1/admissions/:id/discharge - Discharge a patient
const dischargeSchema = z.object({
  status: z.enum(['Discharged', 'Transferred', 'Deceased']),
  notes: z.string().optional()
});

router.patch('/:id/discharge', authenticate, requirePermission('clinical.manage'), requireHospitalScope, validateBody(dischargeSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { status, notes } = req.body;
    
    const admission = await Admission.findOne({ _id: req.params.id, hospitalId, status: 'Admitted' });
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Active admission not found' });
    }

    admission.status = status;
    admission.dischargeDate = new Date();
    if (notes) admission.notes = (admission.notes ? admission.notes + '\n\n' : '') + `Discharge Notes: ${notes}`;
    await admission.save();

    // Free up the bed
    if (admission.wardId) {
      const ward = await BedInventory.findById(admission.wardId);
      if (ward && ward.occupied > 0) {
        ward.occupied -= 1;
        ward.available = ward.total - ward.occupied;
        
        const occupancyRate = ward.occupied / ward.total;
        if (occupancyRate >= 1) ward.publicStatus = 'Full';
        else if (occupancyRate >= 0.9) ward.publicStatus = 'Critical';
        else if (occupancyRate >= 0.75) ward.publicStatus = 'Limited';
        else ward.publicStatus = 'Available';

        await ward.save();
      }
    }

    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error discharging patient' });
  }
});

export default router;
