import express from 'express';
import { User } from '../models/User';
import { Hospital } from '../models/Hospital';
import { Appointment } from '../models/Appointment';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { BedInventory } from '../models/BedInventory';
import { BloodInventory } from '../models/BloodInventory';
import { Response } from 'express';

const router = express.Router();

// GET /api/v1/admin/stats - Ministry Admin national stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'MINISTRY_ADMIN' && req.user?.role !== 'SUPER_ADMIN') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const totalCitizens = await User.countDocuments({ role: 'Citizen' });
    const totalHospitals = await Hospital.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      success: true,
      data: {
        totalCitizens,
        totalHospitals,
        totalAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

// GET /api/v1/admin/users
router.get('/users', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'MINISTRY_ADMIN' && req.user?.role !== 'SUPER_ADMIN') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const users = await User.find({ role: { $ne: 'Citizen' } }).select('-passwordHash');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

// GET /api/v1/admin/beds (HOSPITAL_ADMIN)
router.get('/beds', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'HOSPITAL_ADMIN') return res.status(403).json({ success: false, message: 'Hospital Admin access required' });
    
    const hospitalId = req.query.hospitalId as string || '65d1c313adf98a660362719a'; // Mock for demo

    let beds = await BedInventory.find({ hospitalId }).sort({ wardType: 1 });

    if (beds.length === 0) {
      const defaultWards = ['ICU', 'Medical', 'Surgical', 'Maternity', 'Pediatric', 'Emergency'];
      const seedPromises = defaultWards.map(wardType => 
        BedInventory.create({
          hospitalId, wardType, total: 50, occupied: 0, available: 50, publicStatus: 'Available'
        })
      );
      await Promise.all(seedPromises);
      beds = await BedInventory.find({ hospitalId }).sort({ wardType: 1 });
    }

    res.json({ success: true, data: beds });
  } catch (error) {
    console.error('Fetch beds error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/v1/admin/beds/:id (HOSPITAL_ADMIN)
const updateBedSchema = z.object({
  total: z.number().min(0),
  occupied: z.number().min(0),
});

router.patch('/beds/:id', authenticate, validateBody(updateBedSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'HOSPITAL_ADMIN') return res.status(403).json({ success: false, message: 'Hospital Admin access required' });

    const { total, occupied } = req.body;
    if (occupied > total) return res.status(400).json({ success: false, message: 'Occupied exceeds total' });

    const available = total - occupied;
    
    let publicStatus = 'Available';
    const occupancyRate = occupied / total;
    if (occupancyRate >= 1) publicStatus = 'Full';
    else if (occupancyRate >= 0.9) publicStatus = 'Critical';
    else if (occupancyRate >= 0.75) publicStatus = 'Limited';

    const bed = await BedInventory.findByIdAndUpdate(
      req.params.id,
      { total, occupied, available, publicStatus, lastUpdatedBy: req.user!.id, lastUpdatedAt: new Date() },
      { new: true }
    );

    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    res.json({ success: true, data: bed });
  } catch (error) {
    console.error('Update bed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/admin/blood (HOSPITAL_ADMIN)
router.get('/blood', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'HOSPITAL_ADMIN') return res.status(403).json({ success: false, message: 'Hospital Admin access required' });
    
    const hospitalId = req.query.hospitalId as string || '65d1c313adf98a660362719a';

    let bloods = await BloodInventory.find({ hospitalId }).sort({ bloodGroup: 1 });

    if (bloods.length === 0) {
      const defaultGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const seedPromises = defaultGroups.map(bloodGroup => 
        BloodInventory.create({
          hospitalId, bloodGroup, status: 'adequate', units: 10
        })
      );
      await Promise.all(seedPromises);
      bloods = await BloodInventory.find({ hospitalId }).sort({ bloodGroup: 1 });
    }

    res.json({ success: true, data: bloods });
  } catch (error) {
    console.error('Fetch blood error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/v1/admin/blood/:id (HOSPITAL_ADMIN)
const updateBloodSchema = z.object({
  status: z.enum(['adequate', 'moderate', 'low', 'critical']),
  units: z.number().min(0).optional(),
});

router.patch('/blood/:id', authenticate, validateBody(updateBloodSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'HOSPITAL_ADMIN') return res.status(403).json({ success: false, message: 'Hospital Admin access required' });

    const { status, units } = req.body;

    const blood = await BloodInventory.findByIdAndUpdate(
      req.params.id,
      { status, units, lastUpdatedBy: req.user!.id, lastUpdatedAt: new Date() },
      { new: true }
    );

    if (!blood) return res.status(404).json({ success: false, message: 'Blood record not found' });
    res.json({ success: true, data: blood });
  } catch (error) {
    console.error('Update blood error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
