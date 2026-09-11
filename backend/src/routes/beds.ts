import express, { Response } from 'express';
import { BedInventory } from '../models/BedInventory';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/beds - Check hospital bed availability
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId || req.query.hospitalId;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (req.query.wardType) filter.wardType = req.query.wardType;

    const beds = await BedInventory.find(filter).populate('hospitalId', 'officialName district');

    res.json({ success: true, count: beds.length, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching beds' });
  }
});

// POST /api/v1/beds - Add or update ward
const updateBedsSchema = z.object({
  wardType: z.string(),
  total: z.number().int().min(1),
  occupied: z.number().int().min(0),
});

router.post('/', authenticate, requirePermission('inventory.manage'), requireHospitalScope, validateBody(updateBedsSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { wardType, total, occupied } = req.body;
    const hospitalId = req.user?.hospitalId;
    
    if (occupied > total) {
      return res.status(400).json({ success: false, message: 'Occupied beds cannot exceed total beds' });
    }

    const available = total - occupied;
    let publicStatus: 'Available' | 'Limited' | 'Critical' | 'Full' = 'Available';
    const occupancyRate = occupied / total;
    if (occupancyRate >= 1) publicStatus = 'Full';
    else if (occupancyRate >= 0.9) publicStatus = 'Critical';
    else if (occupancyRate >= 0.75) publicStatus = 'Limited';

    let item = await BedInventory.findOne({ hospitalId, wardType });
    
    if (item) {
      item.total = total;
      item.occupied = occupied;
      item.available = available;
      item.publicStatus = publicStatus;
      item.lastUpdatedAt = new Date();
      await item.save();
    } else {
      item = new BedInventory({
        hospitalId,
        wardType,
        total,
        occupied,
        available,
        publicStatus,
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
