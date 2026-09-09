import express, { Response } from 'express';
import { Prescription } from '../models/Prescription';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { eventBus, EVENTS } from '../events/eventBus';
import { Types } from 'mongoose';
import crypto from 'crypto';

const router = express.Router();

const prescriptionItemSchema = z.object({
  medicineName: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  durationDays: z.number().positive(),
  quantity: z.number().positive(),
  notes: z.string().optional()
});

const createPrescriptionSchema = z.object({
  citizenId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid citizen ID'),
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medicine is required')
});

router.post('/', authenticate, validateBody(createPrescriptionSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, message: 'Only doctors can create prescriptions' });
    }

    const { citizenId, hospitalId, items } = req.body;

    const rand = Math.floor(10000 + Math.random() * 90000);
    const prescriptionNumber = `RX-${Date.now().toString().slice(-6)}-${rand}`;

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30); // 30 days validity

    const prescription = new Prescription({
      citizenId,
      hospitalId,
      doctorId: req.user.id,
      prescriptionNumber,
      items,
      status: 'Active',
      dispenseStatus: 'Pending',
      issueDate: new Date(),
      expireDate
    });

    await prescription.save();

    eventBus.emit(EVENTS.PRESCRIPTION_CREATED, {
      prescriptionId: prescription._id,
      hospitalId,
      prescriptionNumber
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error creating prescription' });
  }
});

export default router;
