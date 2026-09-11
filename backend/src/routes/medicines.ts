import express, { Response } from 'express';
import { MedicineInventory } from '../models/MedicineInventory';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/medicines - Check medicine availability across hospitals
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId || req.query.hospitalId;
    const { genericName, status } = req.query;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (genericName) filter.genericName = new RegExp(genericName as string, 'i');
    if (status) filter.status = status;

    const inventory = await MedicineInventory.find(filter)
      .populate('hospitalId', 'officialName district')
      .sort({ genericName: 1 });

    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching medicines' });
  }
});

// POST /api/v1/medicines - Update or Add medicine stock (Hospital Staff only)
const updateStockSchema = z.object({
  brandName: z.string(),
  genericName: z.string(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  stockLevel: z.number().int().min(0),
});

router.post('/', authenticate, requirePermission('inventory.manage'), requireHospitalScope, validateBody(updateStockSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { brandName, genericName, batchNumber, expiryDate, stockLevel } = req.body;
    const hospitalId = req.user?.hospitalId;
    
    let availability = 'available';
    if (stockLevel === 0) availability = 'out-of-stock';
    else if (stockLevel < 100) availability = 'low-stock';

    let item = await MedicineInventory.findOne({ hospitalId, medicineName: brandName });
    
    if (item) {
      item.stockLevel = stockLevel;
      item.availability = availability as any;
      item.lastUpdatedAt = new Date();
      if (batchNumber && expiryDate) {
         item.notes = `Batch: ${batchNumber}`;
         item.expiryDate = new Date(expiryDate);
      }
      await item.save();
    } else {
      item = new MedicineInventory({
        hospitalId,
        medicineName: brandName,
        genericName,
        stockLevel,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        availability,
        lastUpdatedAt: new Date(),
        notes: batchNumber ? `Batch: ${batchNumber}` : undefined
      });
      await item.save();
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating medicine stock' });
  }
});

export default router;
