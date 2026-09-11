import express, { Response } from 'express';
import { LabResult } from '../models/LabResult';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// 1. Doctor requests a lab test
const requestSchema = z.object({
  citizenId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid citizen ID'),
  testName: z.string(),
  category: z.enum(['Blood', 'Urine', 'Imaging', 'Biopsy', 'Other'])
});

router.post('/request', authenticate, requirePermission('clinical.manage'), requireHospitalScope, validateBody(requestSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { citizenId, testName, category } = req.body;
    const hospitalId = req.user?.hospitalId;

    const labTest = new LabResult({
      citizenId,
      hospitalId,
      doctorId: req.user!.id,
      testName,
      category,
      status: 'Pending',
      interpretation: 'Pending',
      dateOrdered: new Date()
    });

    await labTest.save();

    res.status(201).json({ success: true, data: labTest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Lab Tech gets pending tests for hospital
router.get('/', authenticate, requirePermission('lab.manage'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { status, category } = req.query;
    
    const filter: any = { hospitalId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const pending = await LabResult.find(filter)
      .populate('citizenId', 'name nic')
      .populate('doctorId', 'name title')
      .sort({ dateOrdered: 1 });

    res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Lab Tech completes the test
const completeSchema = z.object({
  resultSummary: z.string(),
  interpretation: z.enum(['Normal', 'Abnormal', 'Critical'])
});

router.post('/:id/complete', authenticate, requirePermission('lab.manage'), requireHospitalScope, validateBody(completeSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { resultSummary, interpretation } = req.body;
    
    const labTest = await LabResult.findOne({ _id: req.params.id, hospitalId });
    if (!labTest) return res.status(404).json({ success: false, message: 'Lab test not found' });

    labTest.status = 'Completed';
    labTest.resultSummary = resultSummary;
    labTest.interpretation = interpretation;
    labTest.dateCompleted = new Date();

    await labTest.save();

    res.json({ success: true, data: labTest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
