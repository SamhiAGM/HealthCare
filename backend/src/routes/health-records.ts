import express, { Response } from 'express';
import { HealthRecord } from '../models/HealthRecord';
import { Citizen } from '../models/Citizen';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get the logged-in citizen's health records
router.get('/my-history', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') {
      return res.status(403).json({ success: false, message: 'Only citizens can access this route' });
    }

    const citizen = await Citizen.findOne({ userId: req.user.id });
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen profile not found' });
    }

    const records = await HealthRecord.find({ citizenId: citizen._id })
      .populate('hospitalId', 'officialName hospitalType')
      .populate('doctorId', 'firstName lastName')
      .sort({ recordDate: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Fetch health records error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching health records' });
  }
});

export default router;
