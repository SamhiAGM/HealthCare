import express, { Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { authenticate, AuthRequest, requirePermission } from '../middleware/auth';

const router = express.Router();

// GET /api/v1/audit - Get audit logs (hospital-scoped or global for super admin)
router.get('/', authenticate, requirePermission('audit.view'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { userId, action, resource, success, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (resource) filter.resource = resource;
    if (success !== undefined) filter.success = success === 'true';

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
      page: parseInt(page as string),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
