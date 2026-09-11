'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

const schema = z.object({
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;
type State = 'idle' | 'loading' | 'success' | 'error';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch('newPassword') || '';
  const passwordStrength = getPasswordStrength(passwordValue);

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid or missing reset token. Please request a new password reset link.');
      setState('error');
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setState('success');
      } else {
        setState('error');
        setErrorMsg(json.error || 'Failed to reset password');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <Logo size="sm" />
        <ThemeToggle compact />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2.25rem', width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          {state === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={32} color="#16A34A" />
              </div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Password Reset Successful</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                style={{ display: 'block', padding: '0.875rem', background: 'var(--teal)', color: 'white', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <KeyRound size={24} color="var(--teal)" />
                </div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Create New Password</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Enter your new password below.
                </p>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem' }} role="alert">
                  <AlertCircle size={16} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{errorMsg}</span>
                    {errorMsg.includes('expired') || errorMsg.includes('Invalid') ? (
                      <Link href="/forgot-password" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#B91C1C', fontWeight: 600 }}>
                        Request new link
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      id="reset-new-password"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 chars, 1 uppercase, 1 number"
                      error={errors.newPassword?.message}
                      disabled={!token}
                      {...register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: '0.75rem', bottom: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

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
                      id="reset-confirm-password"
                      label="Confirm Password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      error={errors.confirmPassword?.message}
                      disabled={!token}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      style={{ position: 'absolute', right: '0.75rem', bottom: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    style={{ borderRadius: 12, marginTop: '0.5rem' }}
                    loading={state === 'loading'}
                    disabled={!token}
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}


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
