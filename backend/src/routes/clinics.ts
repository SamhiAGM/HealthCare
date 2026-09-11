import express, { Response } from 'express';
import { Clinic } from '../models/Clinic';
import { Appointment } from '../models/Appointment';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';
import { createAuditLog } from '../middleware/auditLogger';

const router = express.Router();

// GET /api/v1/clinics - Get all clinics
router.get('/', async (req, res) => {
  try {
    const { hospitalId, day, status } = req.query;
    const filter: any = {};
    if (hospitalId) filter.hospitalId = hospitalId;
    if (day) filter.day = day;
    if (status) filter.status = status;

    const clinics = await Clinic.find(filter)
      .populate('hospitalId', 'officialName district')
      .populate('doctorId', 'name title specialty')
      .sort({ day: 1, startTime: 1 });

    res.json({ success: true, count: clinics.length, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching clinics' });
  }
});

// POST /api/v1/clinics - Create a new clinic (Admin/Hospital only)
const createClinicSchema = z.object({
  name: z.string().min(2),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  capacity: z.number().int().positive().optional(),
  bookingOpen: z.boolean().optional(),
  departmentId: z.string().optional(),
  doctorId: z.string().optional(),
});

router.post('/', authenticate, requirePermission('clinic.manage'), requireHospitalScope, validateBody(createClinicSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    if (!hospitalId) return res.status(400).json({ error: 'Hospital ID required' });

    const clinic = new Clinic({ ...req.body, hospitalId });
    await clinic.save();
    
    await createAuditLog('CLINIC_CREATED', { userId: req.user?.id, details: { clinicId: clinic._id } });

    res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating clinic' });
  }
});

// PATCH /api/v1/clinics/:id/cancel - Clinic Cancellation Workflow
const cancelClinicSchema = z.object({
  reason: z.string().min(5)
});

router.patch('/:id/cancel', authenticate, requirePermission('clinic.manage'), requireHospitalScope, validateBody(cancelClinicSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const clinicId = req.params.id;
    const hospitalId = req.user?.hospitalId;
    const { reason } = req.body;

    const clinic = await Clinic.findOne({ _id: clinicId, hospitalId });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    if (clinic.status === 'Cancelled') return res.status(400).json({ error: 'Clinic is already cancelled' });

    // Workflow: Cancel Clinic -> Stop Appointments -> Cancel existing -> Notify
    clinic.status = 'Cancelled';
    clinic.cancellationReason = reason;
    clinic.bookingOpen = false;
    clinic.lastUpdatedAt = new Date();
    await clinic.save();

    // Find and cancel affected appointments
    const affectedAppointments = await Appointment.find({ clinicId, status: { $in: ['Pending', 'Confirmed'] } });
    
    const cancelPromises = affectedAppointments.map(app => {
      app.status = 'Cancelled';
      app.cancelReason = `Clinic cancelled: ${reason}`;
      return app.save();
    });
    
    await Promise.all(cancelPromises);

    // In a real system, here we would trigger the notification service:
    // EventDispatcher.emit('CLINIC_CANCELLED', { clinicId, affectedCount: affectedAppointments.length });
    
    await createAuditLog('CLINIC_CANCELLED', { 
      userId: req.user?.id, 
      details: { clinicId, reason, affectedAppointments: affectedAppointments.length } 
    });

    res.json({ 
      success: true, 
      message: 'Clinic cancelled successfully', 
      affectedAppointments: affectedAppointments.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling clinic' });
  }
});

export default router;
