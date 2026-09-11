import express, { Response } from 'express';
import { requirePermission, AuthRequest, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { Department } from '../models/Department';
import { User, USER_ROLES } from '../models/User';
import { Shift } from '../models/Shift';
import { Attendance } from '../models/Attendance';
import argon2 from 'argon2';

const router = express.Router();

/* ─── DEPARTMENTS ─── */
const departmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

router.post('/departments', 
  requirePermission('hospital.update'), 
  requireHospitalScope,
  validateBody(departmentSchema), 
  async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      const { name, description } = req.body;
      const hospitalId = req.user?.hospitalId;

      const existing = await Department.findOne({ hospitalId, name });
      if (existing) return res.status(400).json({ error: 'Department already exists' });

      const dept = await Department.create({ hospitalId, name, description });
      res.status(201).json({ data: dept });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create department' });
    }
  }
);

router.get('/departments', requirePermission('hospital.read'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const departments = await Department.find({ hospitalId }).populate('headDoctorId', 'firstName lastName');
    res.json({ data: departments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

/* ─── STAFF MANAGEMENT ─── */
const staffInviteSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES as [string, ...string[]]),
  password: z.string().min(8), // In a real app, generate a password or send invite link
  staffId: z.string(),
});

router.post('/staff', requirePermission('staff.manage'), requireHospitalScope, validateBody(staffInviteSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { email, role, password, staffId, firstName, lastName } = req.body;
    const hospitalId = req.user?.hospitalId;

    const existing = await User.findOne({ $or: [{ email }, { staffId }] });
    if (existing) return res.status(400).json({ error: 'User with email or staff ID already exists' });

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    
    const user = await User.create({
      email,
      staffId,
      passwordHash,
      role,
      hospitalId,
      isVerified: true, // Auto verify staff created by admin
      status: 'Active'
    });

    res.status(201).json({ message: 'Staff member added', data: { id: user._id, email, role, staffId } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add staff' });
  }
});

router.get('/staff', requirePermission('staff.manage'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const staff = await User.find({ hospitalId, role: { $ne: 'CITIZEN' } }).select('-passwordHash');
    res.json({ data: staff });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

/* ─── SHIFTS ─── */
const shiftSchema = z.object({
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  departmentId: z.string().optional(),
});

router.post('/shifts', requirePermission('attendance.manage'), requireHospitalScope, validateBody(shiftSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, startTime, endTime, departmentId } = req.body;
    const hospitalId = req.user?.hospitalId;

    const shift = await Shift.create({ hospitalId, name, startTime, endTime, departmentId });
    res.status(201).json({ data: shift });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

router.get('/shifts', requirePermission('attendance.manage'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const shifts = await Shift.find({ hospitalId }).populate('departmentId', 'name');
    res.json({ data: shifts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

/* ─── ATTENDANCE ─── */
const attendanceSchema = z.object({
  userId: z.string(),
  shiftId: z.string().optional(),
  date: z.string(), // ISO date string
  status: z.enum(['PRESENT', 'ABSENT', 'LEAVE', 'LATE']),
  notes: z.string().optional(),
});

router.post('/attendance', requirePermission('attendance.manage'), requireHospitalScope, validateBody(attendanceSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { userId, shiftId, date, status, notes } = req.body;
    const hospitalId = req.user?.hospitalId;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ hospitalId, userId, date: startOfDay });
    if (existing) {
      existing.status = status;
      existing.notes = notes;
      existing.shiftId = shiftId || existing.shiftId;
      existing.correctedBy = req.user?.id as any;
      await existing.save();
      return res.json({ data: existing });
    }

    const attendance = await Attendance.create({
      hospitalId,
      userId,
      shiftId,
      date: startOfDay,
      status,
      notes,
    });
    res.status(201).json({ data: attendance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

router.get('/attendance', requirePermission('attendance.manage'), requireHospitalScope, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { date } = req.query;
    let query: any = { hospitalId };

    if (date) {
      const queryDate = new Date(date as string);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }

    const records = await Attendance.find(query).populate('userId', 'email staffId role').populate('shiftId', 'name startTime endTime');
    res.json({ data: records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

export default router;
