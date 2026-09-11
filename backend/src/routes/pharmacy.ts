import express, { Response } from 'express';
import { Prescription } from '../models/Prescription';
import { MedicineInventory } from '../models/MedicineInventory';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { eventBus, EVENTS } from '../events/eventBus';

const router = express.Router();

// Middleware to ensure user is PHARMACIST
const requirePharmacist = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'PHARMACIST') {
    return res.status(403).json({ success: false, message: 'Pharmacy access required' });
  }
  next();
};

// Get pending prescriptions for a specific hospital
router.get('/hospital/:hospitalId/pending', authenticate, requirePharmacist, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { hospitalId } = req.params;
    
    // In a real scenario, we would ensure the pharmacist is assigned to this hospitalId

    const pending = await Prescription.find({ 
      hospitalId, 
      dispenseStatus: 'Pending',
      status: 'Active'
    }).populate('citizenId', 'firstName lastName nic')
      .populate('doctorId', 'firstName lastName')
      .sort({ issueDate: 1 });

    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Fetch pending prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dispense a prescription
const dispenseSchema = z.object({
  action: z.enum(['Dispense']) // Simplified for now, can add 'Partial' later
});

router.post('/prescriptions/:id/dispense', authenticate, requirePharmacist, validateBody(dispenseSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.dispenseStatus === 'Dispensed') {
      return res.status(400).json({ success: false, message: 'Already dispensed' });
    }

    // Deduct stock
    for (const item of prescription.items) {
      const inventory = await MedicineInventory.findOne({
        hospitalId: prescription.hospitalId,
        medicineName: item.medicineName
      });
      if (inventory) {
        inventory.stockLevel = Math.max(0, inventory.stockLevel - item.quantity);
        if (inventory.stockLevel === 0) inventory.availability = 'out-of-stock';
        else if (inventory.stockLevel < 100) inventory.availability = 'low-stock';
        await inventory.save();
      }
    }

    prescription.dispenseStatus = 'Dispensed';
    prescription.status = 'Completed'; // Optionally complete the prescription
    await prescription.save();

    eventBus.emit(EVENTS.PRESCRIPTION_DISPENSED, {
      prescriptionId: prescription._id,
      hospitalId: prescription.hospitalId,
      prescriptionNumber: prescription.prescriptionNumber
    });

    res.json({ success: true, data: prescription });
  } catch (error) {
    console.error('Dispense prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error dispensing' });
  }
});

export default router;
