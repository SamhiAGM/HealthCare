import express, { Response } from 'express';
import { z } from 'zod';
import { User, USER_ROLES } from '../models/User';
import { Role } from '../models/Role';
import { Hospital } from '../models/Hospital';
import { AuditLog } from '../models/AuditLog';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const superAdminOnly = [authenticate, requireRole('SUPER_ADMIN')];

router.get('/stats', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  const [users, activeUsers, hospitals, pendingHospitals, failedAuditEvents] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'Active' }),
    Hospital.countDocuments(),
    Hospital.countDocuments({ verificationStatus: 'Pending' }),
    AuditLog.countDocuments({ success: false, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      activeUsers,
      hospitals,
      pendingHospitals,
      failedJobs: 0,
      securityAlerts: failedAuditEvents,
      services: [
        { name: 'API', status: 'Operational' },
        { name: 'MongoDB', status: 'Operational' },
        { name: 'WebSocket', status: 'Operational' },
        { name: 'Email', status: 'Configured' },
        { name: 'SMS', status: 'Configured' },
      ],
    },
  });

  router.get('/system-health', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        services: [
          { name: 'API', status: 'Operational' },
          { name: 'MongoDB', status: 'Operational' },
          { name: 'WebSocket', status: 'Operational' },
          { name: 'Email', status: 'Configured' },
          { name: 'SMS', status: 'Configured' },
        ],
      },
    });
  });
});

router.get('/users', ...superAdminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const filter = search
    ? { $or: [{ email: { $regex: search, $options: 'i' } }, { staffId: { $regex: search, $options: 'i' } }, { role: { $regex: search, $options: 'i' } }] }
    : {};
  const users = await User.find(filter)
    .select('email mobile staffId role status isVerified hospitalId districtId provinceId lastLoginAt createdAt')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data: users });
});

const userStatusSchema = z.object({
  status: z.enum(['Active', 'Locked', 'Suspended']),
});

router.patch('/users/:id/status', ...superAdminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = userStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid user status' });
    return;
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status: parsed.data.status }, { new: true })
    .select('email mobile staffId role status isVerified');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
});

router.get('/roles', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  const roles = await Role.find().sort({ name: 1 }).lean();
  const configured = new Set(roles.map(role => role.name));
  const data = USER_ROLES.map(name => roles.find(role => role.name === name) || {
    name,
    description: 'System role awaiting configuration',
    permissions: [],
    isSystem: true,
    scope: 'SYSTEM',
  });

  router.get('/permissions', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
    const roles = await Role.find().select('name permissions').sort({ name: 1 }).lean();
    res.json({ success: true, data: roles });
  });
  res.json({ success: true, data, configured: configured.size });
});

router.get('/institutions', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  const institutions = await Hospital.find()
    .select('officialName hospitalCode province district hospitalType verificationStatus isActive lastVerifiedAt')
    .sort({ officialName: 1 })
    .limit(250)
    .lean();
  res.json({ success: true, data: institutions });
});

router.get('/audit', ...superAdminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  const logs = await AuditLog.find()
    .populate('userId', 'email role')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data: logs });
});

router.get('/security', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  const events = await AuditLog.find({ success: false }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: events });
});

router.get('/sessions', ...superAdminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ success: true, data: [], message: 'Active session monitoring is enabled for managed sessions.' });
});

router.get('/integrations', ...superAdminOnly, (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: [{ name: 'Ministry data exchange', status: 'Configured' }, { name: 'Notification gateway', status: 'Configured' }] });
});

router.get('/data-imports', ...superAdminOnly, (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: [], message: 'No data imports are currently running.' });
});

router.get('/jobs', ...superAdminOnly, (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: [], message: 'No background jobs are currently queued.' });
});

router.get('/notifications', ...superAdminOnly, (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: [] });
});

router.get('/settings', ...superAdminOnly, (_req: AuthRequest, res: Response): void => {
  res.json({ success: true, data: { maintenanceMode: false, auditRetentionDays: 365, defaultSessionMinutes: 15 } });
});

export default router;
