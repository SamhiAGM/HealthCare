import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from './auth';

type AuditAction =
  | 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT'
  | 'REGISTER' | 'VERIFY_ACCOUNT'
  | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_RESET'
  | 'HOSPITAL_UPDATE' | 'DOCTOR_UPDATE' | 'MEDICINE_UPDATE'
  | 'BED_UPDATE' | 'BLOOD_UPDATE' | 'PRESCRIPTION_CREATE'
  | 'LAB_RESULT_ACCESS' | 'REFERRAL_CREATE'
  | 'STAFF_PERMISSION_CHANGE' | 'CLINIC_CANCELLATION'
  | 'PATIENT_RECORD_ACCESS' | 'DATA_IMPORT';

export async function createAuditLog(
  action: AuditAction,
  options: {
    userId?: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
  } = {}
) {
  try {
    await AuditLog.create({
      action,
      userId: options.userId,
      resource: options.resource,
      resourceId: options.resourceId,
      details: options.details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success: options.success ?? true,
      errorMessage: options.errorMessage,
    });
  } catch (err) {
    // Audit log failure must never break the main request
    console.error('[AUDIT] Failed to write audit log:', err);
  }
}

/** Express middleware that auto-logs the request IP and user agent */
export function auditLogMiddleware(action: AuditAction, resource?: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      const success = res.statusCode < 400;
      createAuditLog(action, {
        userId: req.user?.id,
        resource,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        success,
        errorMessage: !success ? `HTTP ${res.statusCode}` : undefined,
      });
    });
    next();
  };
}
