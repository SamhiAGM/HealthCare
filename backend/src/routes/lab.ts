import express, { Response } from 'express';
import { LabResult } from '../models/LabResult';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { eventBus, EVENTS } from '../events/eventBus';

const router = express.Router();

// Middleware
const requireClinical = (req: AuthRequest, res: Response, next: any) => {
  if (!['DOCTOR', 'NURSE'].includes(req.user?.role || '')) return res.status(403).json({ success: false, message: 'Clinical access required' });
  next();
};

const requireLabTech = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'LAB_TECH') return res.status(403).json({ success: false, message: 'Lab access required' });
  next();
};

// 1. Doctor requests a lab test
const requestSchema = z.object({
  citizenId: z.string(),
  hospitalId: z.string(),
  testName: z.string(),
  category: z.enum(['Blood', 'Urine', 'Imaging', 'Biopsy', 'Other'])
});

router.post('/request', authenticate, requireClinical, validateBody(requestSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { citizenId, hospitalId, testName, category } = req.body;

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

    eventBus.emit(EVENTS.LAB_TEST_REQUESTED, {
      labTestId: labTest._id,
      hospitalId,
      testName,
      category
    });

    res.status(201).json({ success: true, data: labTest });
  } catch (error) {
    console.error('Request lab error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Lab Tech gets pending tests for hospital
router.get('/hospital/:hospitalId/pending', authenticate, requireLabTech, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { hospitalId } = req.params;
    
    const pending = await LabResult.find({ 
      hospitalId, 
      status: 'Pending'
    }).populate('citizenId', 'firstName lastName nic')
      .populate('doctorId', 'firstName lastName')
      .sort({ dateOrdered: 1 });

    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Fetch pending lab error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Lab Tech completes the test
const completeSchema = z.object({
  resultSummary: z.string(),
  interpretation: z.enum(['Normal', 'Abnormal', 'Critical'])
});

router.post('/tests/:id/complete', authenticate, requireLabTech, validateBody(completeSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { resultSummary, interpretation } = req.body;
    
    const labTest = await LabResult.findById(req.params.id);
    if (!labTest) return res.status(404).json({ success: false, message: 'Lab test not found' });

    labTest.status = 'Completed';
    labTest.resultSummary = resultSummary;
    labTest.interpretation = interpretation;
    labTest.dateCompleted = new Date();

    await labTest.save();

    eventBus.emit(EVENTS.LAB_RESULT_COMPLETED, {
      labTestId: labTest._id,
      hospitalId: labTest.hospitalId,
      testName: labTest.testName,
      interpretation
    });

    res.json({ success: true, data: labTest });
  } catch (error) {
    console.error('Complete lab error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
