'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

/* ─── Schemas ──────────────────────────────────────────────────────── */
const step1Schema = z.object({
  nic:         z.string().regex(/^([0-9]{9}[VvXx]|[0-9]{12})$/, 'Enter a valid Sri Lankan NIC (9+V/X or 12 digits)'),
  firstName:   z.string().min(2, 'Minimum 2 characters').max(60, 'Maximum 60 characters').trim(),
  lastName:    z.string().min(2, 'Minimum 2 characters').max(60, 'Maximum 60 characters').trim(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender:      z.enum(['Male', 'Female', 'Other'], { message: 'Please select your gender' }),
});

const step2Schema = z.object({
  mobile:   z.string().regex(/^(\+94|0)[0-9]{9,10}$/, 'Enter a valid Sri Lankan mobile number'),
  email:    z.string().email('Enter a valid email address').or(z.literal('')).optional(),
  address:  z.string().min(5, 'Minimum 5 characters').max(200, 'Maximum 200 characters').optional().or(z.literal('')),
  province: z.string().optional(),
  district: z.string().optional(),
});

const step3Schema = z.object({
  password:        z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  privacyConsent:  z.boolean().refine(v => v, 'You must accept the privacy policy'),
  termsAgreement:  z.boolean().refine(v => v, 'You must accept the terms of use'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const PROVINCES = [
  'Western Province','Central Province','Southern Province',
  'Northern Province','Eastern Province','North Western Province',
  'North Central Province','Uva Province','Sabaragamuwa Province',
];

const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  'Western Province': ['Colombo','Gampaha','Kalutara'],
  'Central Province': ['Kandy','Matale','Nuwara Eliya'],
  'Southern Province': ['Galle','Matara','Hambantota'],
  'Northern Province': ['Jaffna','Kilinochchi','Mannar','Mullaitivu','Vavuniya'],
  'Eastern Province': ['Batticaloa','Ampara','Trincomalee'],
  'North Western Province': ['Kurunegala','Puttalam'],
  'North Central Province': ['Anuradhapura','Polonnaruwa'],
  'Uva Province': ['Badulla','Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura','Kegalle'],
};

const STEPS = [
  { label: 'Personal Info',  description: 'Your identity' },
  { label: 'Contact',        description: 'Stay connected' },
  { label: 'Security',       description: 'Protect your account' },
  { label: 'Verification',   description: 'Confirm your identity' },
];

export default function RegisterPageClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{ step1?: Step1Data; step2?: Step2Data; step3?: Step3Data }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  /* ── Step 1 form ─────────────────────────────────────────────────── */
  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: formData.step1 });
  const onStep1 = (data: Step1Data) => {
    setFormData(prev => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  /* ── Step 2 form ─────────────────────────────────────────────────── */
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: formData.step2 });
  const onStep2 = (data: Step2Data) => {
    setFormData(prev => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  /* ── Step 3 form + submit ─────────────────────────────────────────── */
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema), defaultValues: formData.step3 });
  const onStep3 = async (data: Step3Data) => {
    setFormData(prev => ({ ...prev, step3: data }));
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step1: formData.step1,
          step2: formData.step2,
          step3: data,
        }),
      });
      const json = await res.json();

      if (res.ok) {
        setUserId(json.userId);
        setCurrentStep(4);
      } else {
        setError(json.error || 'Registration failed. Please try again.');
        if (json.details?.step1) setCurrentStep(1);
        else if (json.details?.step2) setCurrentStep(2);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordValue = form3.watch('password') || '';
  const passwordStrength = getPasswordStrength(passwordValue);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Already registered?</span>
          <Link href="/login" style={{ fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</Link>
          <ThemeToggle compact />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 540 }}
        >
          {/* Step indicator */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: currentStep > i + 1 ? 'var(--teal)' : currentStep === i + 1 ? 'var(--teal)' : 'var(--border)',
                    opacity: currentStep === i + 1 ? 1 : currentStep > i + 1 ? 1 : 0.35,
                    transition: 'background 0.3s, opacity 0.3s',
                  }}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Step {currentStep} of {STEPS.length} · {STEPS[currentStep - 1]?.label}
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #0369A1, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <UserPlus size={24} color="white" />
              </div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>
                {currentStep === 4 ? 'Verify Your Account' : 'Create Your LankaCare Account'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {STEPS[currentStep - 1]?.description}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}
              >
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* ── STEP 1 ─────────────────────────────────── */}
              {currentStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={form1.handleSubmit(onStep1)}
                  noValidate
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#9A3412' }}>
                      🔒 Your NIC is encrypted and never displayed publicly. It is used only for identity verification.
                    </div>
                    <Input id="reg-nic" label="National Identity Card (NIC)" type="text" placeholder="e.g. 199012345678 or 900123456V" error={form1.formState.errors.nic?.message} {...form1.register('nic')} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Input id="reg-firstname" label="First Name" type="text" placeholder="e.g. Amal" error={form1.formState.errors.firstName?.message} {...form1.register('firstName')} />
                      <Input id="reg-lastname" label="Last Name" type="text" placeholder="e.g. Perera" error={form1.formState.errors.lastName?.message} {...form1.register('lastName')} />
                    </div>
                    <Input id="reg-dob" label="Date of Birth" type="date" error={form1.formState.errors.dateOfBirth?.message} {...form1.register('dateOfBirth')} />
                    <div>
                      <label htmlFor="reg-gender" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Gender</label>
                      <select id="reg-gender" className="lc-input" {...form1.register('gender')} style={{ cursor: 'pointer' }}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {form1.formState.errors.gender && <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>{form1.formState.errors.gender.message}</p>}
                    </div>
                    <Button type="submit" variant="primary" fullWidth size="lg" style={{ borderRadius: 12, marginTop: '0.5rem' }}>
                      Continue <ChevronRight size={16} />
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 2 ─────────────────────────────────── */}
              {currentStep === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={form2.handleSubmit(onStep2)}
                  noValidate
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input id="reg-mobile" label="Mobile Number" type="tel" placeholder="+94 77 XXX XXXX or 077 XXX XXXX" error={form2.formState.errors.mobile?.message} {...form2.register('mobile')} />
                    <Input id="reg-email" label="Email Address (optional)" type="email" placeholder="your@email.com" error={form2.formState.errors.email?.message} {...form2.register('email')} />
                    <Input id="reg-address" label="Home Address (optional)" type="text" placeholder="Street, City" error={form2.formState.errors.address?.message} {...form2.register('address')} />
                    <div>
                      <label htmlFor="reg-province" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Province (optional)</label>
                      <select
                        id="reg-province"
                        className="lc-input"
                        {...form2.register('province')}
                        onChange={(e) => { setSelectedProvince(e.target.value); form2.setValue('province', e.target.value); form2.setValue('district', ''); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select province</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="reg-district" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>District (optional)</label>
                      <select id="reg-district" className="lc-input" {...form2.register('district')} style={{ cursor: 'pointer' }}>
                        <option value="">Select district</option>
                        {(selectedProvince ? DISTRICTS_BY_PROVINCE[selectedProvince] || [] : Object.values(DISTRICTS_BY_PROVINCE).flat()).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <Button type="button" variant="secondary" size="lg" style={{ borderRadius: 12 }} onClick={() => setCurrentStep(1)}>
                        <ChevronLeft size={16} /> Back
                      </Button>
                      <Button type="submit" variant="primary" fullWidth size="lg" style={{ borderRadius: 12 }}>
                        Continue <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 3 ─────────────────────────────────── */}
              {currentStep === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={form3.handleSubmit(onStep3)}
                  noValidate
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <Input
                        id="reg-password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 chars, 1 uppercase, 1 number"
                        error={form3.formState.errors.password?.message}
                        autoComplete="new-password"
                        {...form3.register('password')}
                        style={{ paddingRight: '2.75rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        style={{ position: 'absolute', right: '0.75rem', bottom: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password strength meter */}
                    {passwordValue && (
                      <div>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '0.25rem' }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < passwordStrength.score ? passwordStrength.color : 'var(--border)', transition: 'background 0.2s' }} />
                          ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: passwordStrength.color }}>{passwordStrength.label}</p>
                      </div>
                    )}

                    <div style={{ position: 'relative' }}>
                      <Input
                        id="reg-confirm-password"
                        label="Confirm Password"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        error={form3.formState.errors.confirmPassword?.message}
                        autoComplete="new-password"
                        {...form3.register('confirmPassword')}
                        style={{ paddingRight: '2.75rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                        style={{ position: 'absolute', right: '0.75rem', bottom: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Consents */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" id="reg-privacy" style={{ accentColor: 'var(--teal)', marginTop: 2 }} {...form3.register('privacyConsent')} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          I agree to the{' '}
                          <Link href="/privacy" target="_blank" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
                          {' '}and consent to the processing of my health data
                        </span>
                      </label>
                      {form3.formState.errors.privacyConsent && <p style={{ fontSize: '0.75rem', color: '#DC2626', marginLeft: '1.5rem' }}>{form3.formState.errors.privacyConsent.message}</p>}

                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" id="reg-terms" style={{ accentColor: 'var(--teal)', marginTop: 2 }} {...form3.register('termsAgreement')} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          I agree to the{' '}
                          <Link href="/terms" target="_blank" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>Terms of Use</Link>
                        </span>
                      </label>
                      {form3.formState.errors.termsAgreement && <p style={{ fontSize: '0.75rem', color: '#DC2626', marginLeft: '1.5rem' }}>{form3.formState.errors.termsAgreement.message}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <Button type="button" variant="secondary" size="lg" style={{ borderRadius: 12 }} onClick={() => setCurrentStep(2)}>
                        <ChevronLeft size={16} /> Back
                      </Button>
                      <Button type="submit" variant="primary" fullWidth size="lg" style={{ borderRadius: 12 }} loading={submitting}>
                        {submitting ? 'Creating Account…' : 'Create Account'}
                      </Button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 4 — SUCCESS / OTP ─────────────────── */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <CheckCircle size={32} color="#16A34A" />
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.625rem' }}>Account Created!</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    A 6-digit verification OTP has been sent to your mobile number. Please check your messages.
                  </p>
                  <Link
                    href={`/verify-account?userId=${userId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.875rem',
                      background: 'var(--teal)',
                      color: 'white',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textDecoration: 'none',
                      marginBottom: '1rem',
                    }}
                  >
                    Verify Account →
                  </Link>
                  <Link href="/login" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    Already verified? Sign In
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
            Protected by AES-256 encryption. Your data complies with Sri Lanka PDP guidelines.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Password strength helper ──────────────────────────────────────── */
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#DC2626', '#D97706', '#0284C7', '#16A34A'];
  return { score, label: labels[score] || 'Weak', color: colors[score] || '#DC2626' };
}
