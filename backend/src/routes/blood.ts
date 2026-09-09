import express from 'express';
import { BloodInventory } from '../models/BloodInventory';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/blood - Public route to check blood availability
router.get('/', async (req, res) => {
  try {
    const { hospitalId, bloodGroup, status } = req.query;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (status) filter.status = status;

    const inventory = await BloodInventory.find(filter)
      .populate('hospitalId', 'name district')
      .sort({ bloodGroup: 1 });

    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching blood inventory' });
  }
});

// POST /api/v1/blood - Update blood stock (Hospital Staff only)
const updateBloodSchema = z.object({
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsAvailable: z.number().int().min(0),
});

router.post('/', authenticate, validateBody(updateBloodSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { hospitalId, bloodGroup, unitsAvailable } = req.body;
    
    let status = 'Adequate';
    if (unitsAvailable === 0) status = 'Critical';
    else if (unitsAvailable < 10) status = 'Low';

    let item = await BloodInventory.findOne({ hospitalId, bloodGroup });
    
    if (item) {
      item.units = unitsAvailable;
      item.status = status as any;
      item.lastUpdatedAt = new Date();
      await item.save();
    } else {
      item = new BloodInventory({
        hospitalId,
        bloodGroup,
        units: unitsAvailable,
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
