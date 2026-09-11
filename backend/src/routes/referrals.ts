import express, { Response } from 'express';
import { Referral } from '../models/Referral';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/referrals - List referrals for this hospital (sent + received)
router.get('/', authenticate, requirePermission('clinical.view'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { direction, status } = req.query;

    let filter: any = {};
    if (direction === 'sent') filter.fromHospitalId = hospitalId;
    else if (direction === 'received') filter.toHospitalId = hospitalId;
    else filter = { $or: [{ fromHospitalId: hospitalId }, { toHospitalId: hospitalId }] };

    if (status) filter.status = status;

    const referrals = await Referral.find(filter)
      .populate('fromHospitalId', 'name')
      .populate('toHospitalId', 'name')
      .populate('citizenId', 'name nic')
      .populate('doctorId', 'name title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: referrals.length, data: referrals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/v1/referrals - Create a new referral
const createSchema = z.object({
  toHospitalId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid hospital ID'),
  citizenId: z.string().refine(val => Types.ObjectId.isValid(val), 'Invalid citizen ID'),
  doctorId: z.string().optional(),
  reason: z.string().min(5, 'Reason is required'),
  urgency: z.enum(['Routine', 'Urgent', 'Emergency']).default('Routine'),
  notes: z.string().optional()
});

router.post('/', authenticate, requirePermission('clinical.manage'), requireHospitalScope, validateBody(createSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const fromHospitalId = req.user?.hospitalId;
    const { toHospitalId, citizenId, doctorId, reason, urgency, notes } = req.body;

    if (toHospitalId === fromHospitalId?.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot refer to the same hospital' });
    }

    const referral = new Referral({
      fromHospitalId, toHospitalId, citizenId,
      doctorId: doctorId || req.user?.id,
      reason, urgency, notes
    });
    await referral.save();

    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/v1/referrals/:id/status - Accept/Reject referral
const statusSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'Completed']),
  notes: z.string().optional()
});

router.patch('/:id/status', authenticate, requirePermission('clinical.manage'), requireHospitalScope, validateBody(statusSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { status, notes } = req.body;

    // Can only update referrals directed to your hospital or from your hospital
    const referral = await Referral.findOne({
      _id: req.params.id,
      $or: [{ toHospitalId: hospitalId }, { fromHospitalId: hospitalId }]
    });

    if (!referral) return res.status(404).json({ success: false, message: 'Referral not found' });

    referral.status = status;
    if (notes) referral.notes = (referral.notes ? referral.notes + '\n' : '') + `[${status}] ${notes}`;
    await referral.save();

    res.json({ success: true, data: referral });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
