import express from 'express';
import { Citizen } from '../models/Citizen';
import { HealthRecord } from '../models/HealthRecord';
import { Prescription } from '../models/Prescription';
import { LabResult } from '../models/LabResult';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = express.Router();

// GET /api/v1/citizen/profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const profile = await Citizen.findById(req.user.id)
      .populate('userId', 'firstName lastName email mobile');
      
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/citizen/health-records
router.get('/health-records', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const records = await HealthRecord.find({ citizenId: req.user.id })
      .populate('hospitalId', 'name district')
      .populate('doctorId', 'userId title')
      .sort({ recordDate: -1 });
      
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/citizen/prescriptions
router.get('/prescriptions', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const prescriptions = await Prescription.find({ citizenId: req.user.id })
      .populate('hospitalId', 'name')
      .populate('doctorId', 'userId title')
      .sort({ issueDate: -1 });
      
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/citizen/lab-results
router.get('/lab-results', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const results = await LabResult.find({ citizenId: req.user.id })
      .populate('hospitalId', 'name')
      .sort({ dateOrdered: -1 });
      
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
