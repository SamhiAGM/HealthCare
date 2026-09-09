import express, { Response } from 'express';
import { Consultation } from '../models/Consultation';
import { Appointment } from '../models/Appointment';
import { QueueToken } from '../models/QueueToken';
import { HealthRecord } from '../models/HealthRecord';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { eventBus, EVENTS } from '../events/eventBus';

const router = express.Router();

// Middleware to ensure user is clinical staff
const requireClinicalStaff = (req: AuthRequest, res: Response, next: any) => {
  if (!['DOCTOR', 'NURSE'].includes(req.user?.role || '')) {
    return res.status(403).json({ success: false, message: 'Clinical access required' });
  }
  next();
};

// Start a consultation
const startSchema = z.object({
  appointmentId: z.string()
});

router.post('/start', authenticate, requireClinicalStaff, validateBody(startSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { appointmentId } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Update appointment status
    appointment.status = 'In-Consultation';
    await appointment.save();

    // Update queue token status if exists
    const queueToken = await QueueToken.findOne({ appointmentId });
    if (queueToken) {
      queueToken.status = 'In-Consultation';
      queueToken.consultationStartAt = new Date();
      await queueToken.save();
    }

    // Create consultation record
    const consultation = new Consultation({
      appointmentId: appointment._id,
      citizenId: appointment.citizenId,
      doctorId: req.user!.id,
      hospitalId: appointment.hospitalId,
      clinicId: appointment.clinicId,
      status: 'Draft',
      startedAt: new Date(),
    });

    await consultation.save();

    eventBus.emit(EVENTS.CONSULTATION_STARTED, {
      appointmentId,
      consultationId: consultation._id,
      hospitalId: appointment.hospitalId,
      clinicId: appointment.clinicId,
      queueTokenNumber: queueToken?.tokenNumber
    });

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({ success: false, message: 'Server error starting consultation' });
  }
});

// Complete consultation
const completeSchema = z.object({
  presentingComplaint: z.string().optional(),
  clinicalNotes: z.string().optional(),
  diagnosis: z.string().optional(),
  plan: z.string().optional(),
});

router.patch('/:id/complete', authenticate, requireClinicalStaff, validateBody(completeSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    // Ensure the doctor completing it is the one who started it
    if (consultation.doctorId.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { presentingComplaint, clinicalNotes, diagnosis, plan } = req.body;

    consultation.presentingComplaint = presentingComplaint;
    consultation.clinicalNotes = clinicalNotes;
    consultation.diagnosis = diagnosis;
    consultation.plan = plan;
    consultation.status = 'Completed';
    consultation.completedAt = new Date();

    await consultation.save();

    // Generate permanent HealthRecord
    const healthRecord = new HealthRecord({
      citizenId: consultation.citizenId,
      hospitalId: consultation.hospitalId,
      doctorId: consultation.doctorId,
      appointmentId: consultation.appointmentId,
      diagnosis: diagnosis || 'Pending Diagnosis',
      symptoms: presentingComplaint ? presentingComplaint.split(',').map(s => s.trim()) : [],
      clinicalNotes: clinicalNotes || '',
      treatmentPlan: plan || '',
      recordDate: new Date(),
    });
    await healthRecord.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(consultation.appointmentId, { status: 'Completed' });

    // Update queue token
    const queueToken = await QueueToken.findOneAndUpdate(
      { appointmentId: consultation.appointmentId },
      { status: 'Completed', completedAt: new Date() }
    );

    eventBus.emit(EVENTS.CONSULTATION_COMPLETED, {
      appointmentId: consultation.appointmentId,
      consultationId: consultation._id,
      hospitalId: consultation.hospitalId,
      clinicId: consultation.clinicId,
      queueTokenNumber: queueToken?.tokenNumber
    });

    res.json({ success: true, data: consultation });
  } catch (error) {
    console.error('Complete consultation error:', error);
    res.status(500).json({ success: false, message: 'Server error completing consultation' });
  }
});

export default router;
