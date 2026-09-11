import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { Role, IRole } from '../models/Role';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    hospitalId?: string;
    districtId?: string;
    provinceId?: string;
  };
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'lc_access_dev';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken || extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as {
      sub: string;
      role: UserRole;
      hospitalId?: string;
      districtId?: string;
      provinceId?: string;
    };

    req.user = {
      id: payload.sub,
      role: payload.role,
      hospitalId: payload.hospitalId,
      districtId: payload.districtId,
      provinceId: payload.provinceId,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken || extractBearerToken(req);
  if (!token) { return next(); }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as {
      sub: string; role: UserRole; hospitalId?: string; districtId?: string; provinceId?: string;
    };
    req.user = { id: payload.sub, role: payload.role, hospitalId: payload.hospitalId, districtId: payload.districtId, provinceId: payload.provinceId };
  } catch { /* ignore invalid optional token */ }
  next();
}

/** Role-based access control guard */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

// In-memory cache for roles to avoid DB lookup on every request
let roleCache: Record<string, IRole> = {};
let lastCacheUpdate = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function getRolePermissions(roleName: string): Promise<string[]> {
  const now = Date.now();
  if (!roleCache[roleName] || now - lastCacheUpdate > CACHE_TTL) {
    const roles = await Role.find({});
    roleCache = roles.reduce((acc, role) => {
      acc[role.name] = role;
      return acc;
    }, {} as Record<string, IRole>);
    lastCacheUpdate = now;
  }
  return roleCache[roleName]?.permissions || [];
}

/** Granular permission-based access control guard */
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // Super admins always have access
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    try {
      const permissions = await getRolePermissions(req.user.role);
      if (!permissions.includes(permission)) {
        res.status(403).json({ error: `Missing required permission: ${permission}` });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error verifying permissions' });
    }
  };
}

/** Ensure the requesting user is accessing their own resource */
export function requireOwnership(getResourceUserId: (req: AuthRequest) => string | undefined) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const resourceUserId = getResourceUserId(req);
    if (req.user.id !== resourceUserId && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'MINISTRY_ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
}

/** Ensure hospital staff only access their own hospital */
export function requireHospitalScope(req: AuthRequest, res: Response, next: NextFunction) {
  const hospitalIdParam = req.params.hospitalId || req.body?.hospitalId;
  if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

  const ministryRoles: UserRole[] = ['MINISTRY_ADMIN', 'SUPER_ADMIN', 'AUDITOR'];
  if (ministryRoles.includes(req.user.role)) return next();

  if (req.user.hospitalId && hospitalIdParam && req.user.hospitalId !== hospitalIdParam) {
    res.status(403).json({ error: 'Access denied to this hospital' });
    return;
  }
  next();
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}
