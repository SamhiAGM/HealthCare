import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { Citizen } from '../models/Citizen';
import { OTP } from '../models/OTP';
import { RefreshSession } from '../models/RefreshSession';
import { Province } from '../models/Province';
import { District } from '../models/District';
import { validateBody } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../middleware/auditLogger';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'samhiag9958@gmail.com',
    pass: 'crfh itdv yaww xsao'
  }
});

async function sendEmailOTP(to: string, otp: string, purpose: string) {
  const subject = purpose === 'RESET_PASSWORD' 
    ? 'LankaCare Password Reset OTP' 
    : 'LankaCare Account Verification OTP';
    
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; padding: 24px;">
      <h2 style="color: #0D9488; text-align: center; margin-bottom: 24px;">HealthCare / LankaCare</h2>
      <p style="font-size: 16px; color: #333;">Here is your 6-digit One Time Password (OTP):</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #666;">This OTP will expire in 5 minutes.</p>
      <p style="font-size: 14px; color: #666; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"HealthCare / LankaCare" <samhiag9958@gmail.com>',
      to,
      subject,
      html
    });
    console.log(`[MAILER] Sent OTP to ${to}`);
  } catch (err) {
    console.error(`[MAILER] Failed to send OTP to ${to}:`, err);
  }
}

const router = Router();

/* ─── Config ─────────────────────────────────────────────────────────── */
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || process.env.JWT_SECRET || 'lc_access_dev';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'lc_refresh_dev';
const ACCESS_EXPIRY  = '15m';
const REFRESH_EXPIRY = '30d';
const MAX_FAILED_ATTEMPTS = 50;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

/* ─── Rate limiters ──────────────────────────────────────────────────── */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { error: 'Too many OTP requests. Please wait before requesting another.' },
});

/* ─── Validators ─────────────────────────────────────────────────────── */
const NIC_REGEX = /^([0-9]{9}[VvXx]|[0-9]{12})$/;
const PHONE_REGEX = /^(\+94|0)[0-9]{9,10}$/;

const registerStep1Schema = z.object({
  nic:          z.string().regex(NIC_REGEX, 'Invalid Sri Lankan NIC'),
  firstName:    z.string().min(2).max(60).trim(),
  lastName:     z.string().min(2).max(60).trim(),
  dateOfBirth:  z.string().date(),
  gender:       z.enum(['Male', 'Female', 'Other']),
});

const registerStep2Schema = z.object({
  mobile:    z.string().regex(PHONE_REGEX, 'Invalid Sri Lankan mobile number'),
  email:     z.string().email().optional().or(z.literal('')),
  address:   z.string().min(5).max(200).optional(),
  province:  z.string().optional(),
  district:  z.string().optional(),
});

const registerStep3Schema = z.object({
  password:        z.string().min(8).max(100)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  privacyConsent:  z.boolean().refine(v => v === true, 'You must accept the privacy policy'),
  termsAgreement:  z.boolean().refine(v => v === true, 'You must accept the terms of use'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  identifier: z.string().min(3),  // NIC, email, mobile, or staffId
  password:   z.string().min(1),
  remember:   z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3),
});

const resetPasswordSchema = z.object({
  userId:          z.string(),
  otp:             z.string().length(6, 'OTP must be 6 digits'),
  newPassword:     z.string().min(8).max(100)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function normalizePhone(phone: string): string {
  if (phone.startsWith('+94')) return phone;
  if (phone.startsWith('0'))   return '+94' + phone.slice(1);
  return phone;
}

function hashNic(nic: string): string {
  return crypto.createHash('sha256').update(nic.toUpperCase()).digest('hex');
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return local.slice(0, 2) + '***@' + domain;
}

function maskPhone(phone: string): string {
  return phone.slice(0, 5) + '***' + phone.slice(-3);
}

function createTokens(userId: string, role: string, options: { hospitalId?: string; districtId?: string; provinceId?: string } = {}) {
  const accessToken = jwt.sign(
    { sub: userId, role, ...options },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return { accessToken, refreshToken, refreshTokenHash };
}

function setCookies(res: Response, accessToken: string, refreshToken: string, remember: boolean) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/v1/auth/refresh',
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
}

/* ─── STEP 1 - Validate NIC (pre-registration check) ─────────────────── */
router.post('/register/check-nic', validateBody(registerStep1Schema), async (req: Request, res: Response) => {
  try {
    const { nic } = req.body;
    const nicHashValue = hashNic(nic);

    const existing = await User.findOne({ nicHash: nicHashValue });
    if (existing) {
      res.status(409).json({ error: 'An account with this NIC already exists' });
      return;
    }
    res.json({ available: true });
  } catch {
    res.status(500).json({ error: 'Server error checking NIC' });
  }
});

/* ─── REGISTER (full multi-step, combined endpoint) ─────────────────── */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate all three steps
    const step1 = registerStep1Schema.safeParse(req.body.step1);
    const step2 = registerStep2Schema.safeParse(req.body.step2);
    const step3 = registerStep3Schema.safeParse(req.body.step3);

    const errors: Record<string, unknown> = {};
    if (!step1.success) errors.step1 = step1.error.flatten().fieldErrors;
    if (!step2.success) errors.step2 = step2.error.flatten().fieldErrors;
    if (!step3.success) errors.step3 = step3.error.flatten().fieldErrors;

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const s1 = step1.data!;
    const s2 = step2.data!;
    const s3 = step3.data!;

    // Check NIC uniqueness
    const nicHashValue = hashNic(s1.nic);
    const existingByNic = await User.findOne({ nicHash: nicHashValue });
    if (existingByNic) {
      res.status(409).json({ error: 'An account with this NIC already exists' });
      return;
    }

    // Normalize phone
    const normalizedMobile = normalizePhone(s2.mobile);

    // Check email uniqueness
    if (s2.email) {
      const existingByEmail = await User.findOne({ email: s2.email });
      if (existingByEmail) {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }
    }

    // Check mobile uniqueness
    const existingByMobile = await User.findOne({ mobile: normalizedMobile });
    if (existingByMobile) {
      res.status(409).json({ error: 'An account with this mobile number already exists' });
      return;
    }

    // Hash password
    const passwordHash = await argon2.hash(s3.password, { type: argon2.argon2id });

    // Create user
    const user = await User.create({
      nicHash: nicHashValue,
      email: s2.email || undefined,
      mobile: normalizedMobile,
      passwordHash,
      role: 'CITIZEN',
      isVerified: false,
      status: 'Active',
    });

    // Resolve province and district
    let provinceDoc, districtDoc;
    if (s2.province) provinceDoc = await Province.findOne({ nameEn: s2.province });
    if (s2.district) districtDoc = await District.findOne({ nameEn: s2.district });

    // Create citizen record
    await Citizen.create({
      userId: user._id,
      firstName: s1.firstName,
      lastName: s1.lastName,
      dateOfBirth: new Date(s1.dateOfBirth),
      gender: s1.gender,
      address: s2.address,
      provinceId: provinceDoc?._id,
      districtId: districtDoc?._id,
    });

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.create({
      userId: user._id,
      hashedOtp,
      purpose: 'VERIFY_ACCOUNT',
      expiresAt,
      deliveredTo: s2.email ? maskEmail(s2.email) : maskPhone(normalizedMobile),
    });

    // In development: log OTP to console (never in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP for ${user.email || normalizedMobile}: ${otp}`);
    }

    if (s2.email) {
      sendEmailOTP(s2.email, otp, 'VERIFY_ACCOUNT').catch(console.error);
    }

    await createAuditLog('REGISTER', {
      userId: String(user._id),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Account created. Please verify with the OTP sent to your contact.',
      userId: user._id,
      deliveredTo: s2.email ? maskEmail(s2.email) : maskPhone(normalizedMobile),
    });
  } catch (err: unknown) {
    console.error('[REGISTER]', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/* ─── VERIFY OTP ─────────────────────────────────────────────────────── */
router.post('/verify-otp', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, otp, purpose = 'VERIFY_ACCOUNT' } = req.body;
    if (!userId || !otp) {
      res.status(400).json({ error: 'User ID and OTP are required' });
      return;
    }

    const otpRecord = await OTP.findOne({
      userId,
      purpose,
      used: false,
      expiresAt: { $gt: new Date() },
    }).select('+hashedOtp');

    if (!otpRecord) {
      res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
      return;
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    const valid = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!valid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts;
      res.status(400).json({ error: `Invalid OTP. ${remaining} attempts remaining.` });
      return;
    }

    // Mark OTP used
    otpRecord.used = true;
    await otpRecord.save();

    if (purpose === 'VERIFY_ACCOUNT') {
      await User.findByIdAndUpdate(userId, { isVerified: true });
      await createAuditLog('VERIFY_ACCOUNT', { userId, ipAddress: req.ip });
      res.json({ message: 'Account verified successfully. You can now sign in.' });
    } else {
      // For RESET_PASSWORD — return a signed short-lived reset token
      const resetToken = jwt.sign({ sub: userId, purpose: 'RESET_PASSWORD' }, ACCESS_SECRET, { expiresIn: '10m' });
      res.json({ message: 'OTP verified', resetToken });
    }
  } catch {
    res.status(500).json({ error: 'Verification failed' });
  }
});

/* ─── RESEND OTP ─────────────────────────────────────────────────────── */
router.post('/resend-otp', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, purpose = 'VERIFY_ACCOUNT' } = req.body;
    if (!userId) { res.status(400).json({ error: 'User ID required' }); return; }

    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Invalidate old OTPs
    await OTP.updateMany({ userId, purpose }, { used: true });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.create({ userId, hashedOtp, purpose, expiresAt });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Resent OTP for ${userId}: ${otp}`);
    }

    if (user.email) {
      sendEmailOTP(user.email, otp, purpose).catch(console.error);
    }

    res.json({ message: 'OTP resent. Please check your contact.' });
  } catch {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

/* ─── LOGIN ─────────────────────────────────────────────────────────── */
router.post('/login', loginLimiter, validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { identifier, password, remember } = req.body;

    // Find user by NIC hash, email, mobile, or staffId
    const nicHashValue = NIC_REGEX.test(identifier) ? hashNic(identifier) : null;

    const user = await User.findOne({
      $or: [
        ...(nicHashValue ? [{ nicHash: nicHashValue }] : []),
        { email: identifier.toLowerCase() },
        { mobile: normalizePhone(identifier) },
        { staffId: identifier.toUpperCase() },
      ],
    }).select('+passwordHash');

    if (!user) {
      // Uniform error — do not reveal which field matched
      await createAuditLog('LOGIN_FAILED', { ipAddress: req.ip, userAgent: req.headers['user-agent'], details: { identifier: '***' }, success: false });
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check lock status
    if (user.status === 'Locked') {
      const lockExpiry = user.lockedAt ? new Date(user.lockedAt.getTime() + LOCKOUT_DURATION_MS) : new Date();
      if (lockExpiry > new Date()) {
        res.status(403).json({ error: 'Account temporarily locked due to too many failed attempts. Try again later.' });
        return;
      }
      // Auto-unlock after timeout
      user.status = 'Active';
      user.failedLoginAttempts = 0;
    }

    if (user.status === 'Suspended') {
      res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
      return;
    }

    // Verify password
    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.status = 'Locked';
        user.lockedAt = new Date();
      }
      await user.save();
      await createAuditLog('LOGIN_FAILED', { userId: String(user._id), ipAddress: req.ip, success: false });
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check verified
    if (!user.isVerified) {
      res.status(403).json({
        error: 'Account not verified. Please verify your account first.',
        userId: user._id,
        requiresVerification: true,
      });
      return;
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const { accessToken, refreshToken, refreshTokenHash } = createTokens(
      String(user._id),
      user.role,
      {
        hospitalId: user.hospitalId ? String(user.hospitalId) : undefined,
        districtId: user.districtId ? String(user.districtId) : undefined,
        provinceId: user.provinceId ? String(user.provinceId) : undefined,
      }
    );

    // Store refresh session
    await RefreshSession.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000),
    });

    setCookies(res, accessToken, refreshToken, !!remember);

    await createAuditLog('LOGIN', { userId: String(user._id), ipAddress: req.ip, userAgent: req.headers['user-agent'] });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('[LOGIN]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ─── REFRESH TOKEN ──────────────────────────────────────────────────── */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await RefreshSession.findOne({
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      // Possible token theft — revoke all sessions
      const decoded = jwt.decode(refreshToken) as { sub?: string } | null;
      if (decoded?.sub) {
        await RefreshSession.updateMany({ userId: decoded.sub }, { isRevoked: true, revokedAt: new Date() });
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(401).json({ error: 'Invalid refresh token. Please login again.' });
      return;
    }

    const user = await User.findById(session.userId);
    if (!user || user.status !== 'Active') {
      res.status(401).json({ error: 'Account not accessible' });
      return;
    }

    // Rotate token (revoke old, issue new)
    session.isRevoked = true;
    session.revokedAt = new Date();
    await session.save();

    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash: newHash } = createTokens(
      String(user._id),
      user.role,
      {
        hospitalId: user.hospitalId ? String(user.hospitalId) : undefined,
        districtId: user.districtId ? String(user.districtId) : undefined,
        provinceId: user.provinceId ? String(user.provinceId) : undefined,
      }
    );

    await RefreshSession.create({
      userId: user._id,
      tokenHash: newHash,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
      expiresAt: session.expiresAt,
    });

    setCookies(res, accessToken, newRefreshToken, true);
    res.json({ message: 'Token refreshed', user: { id: user._id, role: user.role } });
  } catch {
    res.status(401).json({ error: 'Could not refresh session' });
  }
});

/* ─── LOGOUT ─────────────────────────────────────────────────────────── */
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshSession.findOneAndUpdate({ tokenHash }, { isRevoked: true, revokedAt: new Date() });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

    await createAuditLog('LOGOUT', { userId: req.user?.id, ipAddress: req.ip });

    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ error: 'Logout failed' });
  }
});

/* ─── LOGOUT ALL DEVICES ─────────────────────────────────────────────── */
router.post('/logout-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await RefreshSession.updateMany(
      { userId: req.user!.id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    await createAuditLog('LOGOUT', { userId: req.user?.id, details: { allDevices: true } });
    res.json({ message: 'Logged out from all devices' });
  } catch {
    res.status(500).json({ error: 'Logout failed' });
  }
});

/* ─── FORGOT PASSWORD ────────────────────────────────────────────────── */
router.post('/forgot-password', loginLimiter, validateBody(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    // Never reveal if account exists (timing-safe, uniform response)
    const GENERIC_MSG = 'If an account exists with those details, an OTP has been sent.';

    const nicHashValue = NIC_REGEX.test(identifier) ? hashNic(identifier) : null;
    const user = await User.findOne({
      $or: [
        ...(nicHashValue ? [{ nicHash: nicHashValue }] : []),
        { email: identifier.toLowerCase() },
        { mobile: normalizePhone(identifier) },
      ],
    });

    if (!user) {
      // Sleep briefly to prevent timing attack
      await new Promise(r => setTimeout(r, 200));
      res.json({ message: GENERIC_MSG });
      return;
    }

    // Invalidate existing reset OTPs
    await OTP.updateMany({ userId: user._id, purpose: 'RESET_PASSWORD' }, { used: true });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.create({
      userId: user._id,
      hashedOtp,
      purpose: 'RESET_PASSWORD',
      expiresAt,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset OTP for ${user._id}: ${otp}`);
    }

    if (user.email) {
      sendEmailOTP(user.email, otp, 'RESET_PASSWORD').catch(console.error);
    }

    await createAuditLog('PASSWORD_RESET_REQUEST', { userId: String(user._id), ipAddress: req.ip });

    res.json({ message: GENERIC_MSG, userId: user._id });
  } catch {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

/* ─── RESET PASSWORD ─────────────────────────────────────────────────── */
router.post('/reset-password', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    let payload: { sub: string; purpose: string };
    try {
      payload = jwt.verify(resetToken, ACCESS_SECRET) as { sub: string; purpose: string };
    } catch {
      res.status(400).json({ error: 'Reset token expired. Please start the password reset process again.' });
      return;
    }

    if (payload.purpose !== 'RESET_PASSWORD') {
      res.status(400).json({ error: 'Invalid reset token' });
      return;
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await User.findByIdAndUpdate(payload.sub, { passwordHash });

    // Revoke all sessions
    await RefreshSession.updateMany({ userId: payload.sub }, { isRevoked: true, revokedAt: new Date() });

    await createAuditLog('PASSWORD_RESET', { userId: payload.sub, ipAddress: req.ip });

    res.json({ message: 'Password reset successfully. Please sign in with your new password.' });
  } catch {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

/* ─── GET ME (current user info) ────────────────────────────────────── */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-passwordHash -nicHash -nicEncrypted');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const citizen = user.role === 'CITIZEN'
      ? await Citizen.findOne({ userId: user._id })
          .populate('provinceId', 'nameEn')
          .populate('districtId', 'nameEn')
      : null;

    // Fetch permissions for the role
    const { Role } = await import('../models/Role.js');
    const roleDoc = await Role.findOne({ name: user.role });
    const permissions = roleDoc ? roleDoc.permissions : [];

    res.json({ user, citizen, permissions });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

/* ─── GET SESSIONS ─────────────────────────────────────────────────── */
router.get('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await RefreshSession.find({
      userId: req.user!.id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).select('-tokenHash').sort({ createdAt: -1 });

    res.json({ sessions });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

export default router;
