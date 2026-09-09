import express from 'express';
import { MedicineInventory } from '../models/MedicineInventory';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/medicines - Public route to check medicine availability across hospitals
router.get('/', async (req, res) => {
  try {
    const { hospitalId, genericName, status } = req.query;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (genericName) filter.genericName = new RegExp(genericName as string, 'i');
    if (status) filter.status = status;

    const inventory = await MedicineInventory.find(filter)
      .populate('hospitalId', 'name district')
      .sort({ genericName: 1 });

    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching medicines' });
  }
});

// POST /api/v1/medicines - Update or Add medicine stock (Hospital Staff only)
const updateStockSchema = z.object({
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  brandName: z.string(),
  genericName: z.string(),
  batchNumber: z.string(),
  expiryDate: z.string(),
  stockLevel: z.number().int().min(0),
});

router.post('/', authenticate, validateBody(updateStockSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { hospitalId, brandName, genericName, batchNumber, expiryDate, stockLevel } = req.body;
    
    let availability = 'available';
    if (stockLevel === 0) availability = 'out-of-stock';
    else if (stockLevel < 100) availability = 'low-stock';

    let item = await MedicineInventory.findOne({ hospitalId, medicineName: brandName });
    
    if (item) {
      item.availability = availability as any;
      item.lastUpdatedAt = new Date();
      await item.save();
    } else {
      item = new MedicineInventory({
        hospitalId,
        medicineName: brandName,
        genericName,
        expiryDate: new Date(expiryDate),
        availability,
        lastUpdatedAt: new Date(),
        notes: `Batch: ${batchNumber}, Stock: ${stockLevel}`
      });
      await item.save();
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating medicine stock' });
  }
});

export default router;
