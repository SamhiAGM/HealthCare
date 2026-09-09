import express from 'express';
import { BedInventory } from '../models/BedInventory';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/beds - Check hospital bed availability
router.get('/', async (req, res) => {
  try {
    const { hospitalId, wardType } = req.query;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (wardType) filter.wardType = wardType;

    const beds = await BedInventory.find(filter).populate('hospitalId', 'name district');

    res.json({ success: true, count: beds.length, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching beds' });
  }
});

// POST /api/v1/beds - Add or update ward
const updateBedsSchema = z.object({
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  wardName: z.string(),
  wardType: z.enum(['General', 'ICU', 'Maternity', 'Pediatric', 'Emergency', 'Isolation']),
  totalBeds: z.number().int().min(1),
  occupiedBeds: z.number().int().min(0),
});

router.post('/', authenticate, validateBody(updateBedsSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { hospitalId, wardName, wardType, totalBeds, occupiedBeds } = req.body;
    
    if (occupiedBeds > totalBeds) {
      return res.status(400).json({ success: false, message: 'Occupied beds cannot exceed total beds' });
    }

    let item = await BedInventory.findOne({ hospitalId, wardName });
    
    if (item) {
      item.total = totalBeds;
      item.occupied = occupiedBeds;
      item.lastUpdatedAt = new Date();
      await item.save();
    } else {
      item = new BedInventory({
        hospitalId,
        wardName,
        wardType,
        total: totalBeds,
        occupied: occupiedBeds,
        lastUpdatedAt: new Date()
      });
      await item.save();
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating beds' });
  }
});

export default router;
