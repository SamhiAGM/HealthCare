import express, { Response } from 'express';
import { QueueToken } from '../models/QueueToken';
import { Consultation } from '../models/Consultation';
import { Prescription } from '../models/Prescription';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Middleware to ensure user is from the MINISTRY
const requireMinistry = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'MINISTRY') {
    return res.status(403).json({ success: false, message: 'Ministry access required' });
  }
  next();
};

// Get aggregate national statistics
router.get('/stats', authenticate, requireMinistry, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatientsToday,
      liveConsultations,
      totalDispensedPrescriptions
    ] = await Promise.all([
      // Count all patients who got a queue token today
      QueueToken.countDocuments({ date: { $gte: today } }),
      
      // Count consultations currently in "Draft" (meaning they are actively open)
      Consultation.countDocuments({ status: 'Draft' }),

      // Count prescriptions dispensed today
      Prescription.countDocuments({ dispenseStatus: 'Dispensed', updatedAt: { $gte: today } })
    ]);

    res.json({
      success: true,
      data: {
        totalPatientsToday,
        liveConsultations,
        totalDispensedPrescriptions
      }
    });
  } catch (error) {
    console.error('Fetch ministry stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

export default router;
