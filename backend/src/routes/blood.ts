import express, { Response } from 'express';
import { BloodInventory } from '../models/BloodInventory';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/blood - Check blood availability
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId || req.query.hospitalId;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.status) filter.status = req.query.status;

    const inventory = await BloodInventory.find(filter)
      .populate('hospitalId', 'officialName district')
      .sort({ bloodGroup: 1 });

    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching blood inventory' });
  }
});

// POST /api/v1/blood - Update blood stock (Hospital Staff only)
const updateBloodSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  units: z.number().int().min(0),
});

router.post('/', authenticate, requirePermission('inventory.manage'), requireHospitalScope, validateBody(updateBloodSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { bloodGroup, units } = req.body;
    const hospitalId = req.user?.hospitalId;
    
    let status = 'adequate';
    if (units === 0) status = 'critical';
    else if (units < 10) status = 'low';
    else if (units < 30) status = 'moderate';

    let item = await BloodInventory.findOne({ hospitalId, bloodGroup });
    
    if (item) {
      item.units = units;
      item.status = status as any;
      item.lastUpdatedAt = new Date();
      await item.save();
    } else {
      item = new BloodInventory({
        hospitalId,
        bloodGroup,
        units,
        status,
        lastUpdatedAt: new Date()
      });
      await item.save();
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating blood stock' });
  }
});

export default router;
