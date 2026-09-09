import express from 'express';
import { Appointment } from '../models/Appointment';
import { Clinic } from '../models/Clinic';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { eventBus, EVENTS } from '../events/eventBus';

const router = express.Router();

// Get citizen's appointments
router.get('/my-appointments', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') {
      return res.status(403).json({ success: false, message: 'Only citizens can access this route' });
    }

    const appointments = await Appointment.find({ citizenId: req.user.id })
      .populate('hospitalId', 'name district')
      .populate('clinicId', 'name room')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching appointments' });
  }
});

// Book a new appointment
const bookSchema = z.object({
  hospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  clinicId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid clinic ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  timeSlot: z.string().optional(),
  reason: z.string().optional(),
});

router.post('/book', authenticate, validateBody(bookSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'CITIZEN') {
      return res.status(403).json({ success: false, message: 'Only citizens can book appointments' });
    }

    const { hospitalId, clinicId, date, timeSlot, reason } = req.body;

    // Check clinic capacity
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    const targetDate = new Date(date);
    const existingCount = await Appointment.countDocuments({ clinicId, date: targetDate });

    if (clinic.capacity && existingCount >= clinic.capacity) {
      return res.status(400).json({ success: false, message: 'Clinic is fully booked for this date' });
    }

    // Generate appointment number
    const dateStr = date.replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const appointmentNumber = `APT-${dateStr}-${rand}`;

    // Generate fake QR code string (just a signed hash)
    const qrCode = crypto.createHash('sha256').update(appointmentNumber + process.env.JWT_SECRET).digest('hex').substring(0, 20);

    const appointment = new Appointment({
      citizenId: req.user.id,
      hospitalId,
      clinicId,
      date: targetDate,
      timeSlot,
      reason,
      appointmentNumber,
      qrCode,
      status: 'Confirmed'
    });

    await appointment.save();

    eventBus.emit(EVENTS.APPOINTMENT_CREATED, {
      appointmentId: appointment._id,
      hospitalId,
      clinicId,
      date: targetDate,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error booking appointment' });
  }
});

// Cancel appointment
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    // Authorization: Must be the owner citizen or an admin
    if (req.user?.role === 'CITIZEN' && appointment.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    appointment.status = 'Cancelled';
    appointment.cancelReason = req.body.reason || 'Cancelled by user';
    await appointment.save();

    eventBus.emit(EVENTS.APPOINTMENT_CANCELLED, {
      appointmentId: appointment._id,
      hospitalId: appointment.hospitalId,
      clinicId: appointment.clinicId,
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling appointment' });
  }
});

export default router;
