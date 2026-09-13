'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, AlertCircle, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

const NIC_REGEX = /^([0-9]{9}[VvXx]|[0-9]{12})$/;

const loginSchema = z.object({
  identifier: z.string().regex(NIC_REGEX, 'Please enter a valid Sri Lankan NIC (e.g. 123456789V or 199012345678)'),
  password:   z.string().min(1, 'Password is required'),
  remember:   z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginState = 'idle' | 'loading' | 'success' | 'error' | 'locked' | 'unverified';

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [unverifiedUserId, setUnverifiedUserId] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        setState('success');
        // Redirect based on role
        const role = json.user?.role;
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        if (returnUrl) {
          router.push(returnUrl);
        } else if (role === 'CITIZEN') {
          router.push('/citizen/dashboard');
        } else if (role === 'HOSPITAL_ADMIN') {
          router.push('/admin/dashboard');
        } else if (role === 'DOCTOR' || role === 'NURSE') {
          router.push('/doctor/queue');
        } else if (role === 'PHARMACIST') {
          router.push('/pharmacy/dashboard');
        } else if (role === 'LAB_STAFF') {
          router.push('/lab/dashboard');
        } else if (role === 'RECEPTION_STAFF') {
          router.push('/reception/dashboard');
        } else if (role === 'MINISTRY_ADMIN' || role === 'SUPER_ADMIN') {
          router.push('/ministry/dashboard');
        } else {
          router.push('/citizen/dashboard');
        }
      } else if (res.status === 403 && json.requiresVerification) {
        setState('unverified');
        setUnverifiedUserId(json.userId);
      } else if (res.status === 403) {
        setState('locked');
        setErrorMsg(json.error || 'Account locked');
      } else {
        setState('error');
        setErrorMsg(json.error || 'Invalid credentials');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}
      >
        <Logo size="sm" />
        <ThemeToggle compact />
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '2.25rem',
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #0369A1, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <LogIn size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.375rem' }}>
              Sign in to LankaCare
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Access your digital health portal
            </p>
          </div>

          {/* Status messages */}
          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{errorMsg}</span>
            </motion.div>
          )}

          {state === 'locked' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                background: '#FFFBEB',
                border: '1px solid #FEF3C7',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <Lock size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400E' }}>Account Temporarily Locked</div>
                <div style={{ fontSize: '0.8125rem', color: '#B45309' }}>{errorMsg}</div>
              </div>
            </motion.div>
          )}

          {state === 'unverified' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 12,
                padding: '0.875rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1D4ED8', marginBottom: '0.375rem' }}>
                Account Not Verified
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#2563EB', margin: '0 0 0.625rem' }}>
                Please verify your account with the OTP sent to your contact.
              </p>
              <Link
                href={`/verify-account?userId=${unverifiedUserId}`}
                style={{
                  display: 'inline-block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#1D4ED8',
                  background: 'white',
                  border: '1.5px solid #93C5FD',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                Verify Account →
              </Link>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="National Identity Card (NIC)"
                id="login-identifier"
                type="text"
                autoComplete="username"
                placeholder="e.g. 199012345678 or 123456789V"
                error={errors.identifier?.message}
                {...register('identifier')}
              />

              <Input
                label="Password"
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    id="login-remember"
                    style={{ accentColor: 'var(--teal)', width: 15, height: 15 }}
                    {...register('remember')}
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--teal)',
                    textDecoration: 'none',
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={state === 'loading'}
                disabled={state === 'success'}
                style={{ borderRadius: 12, marginTop: '0.25rem' }}
                aria-label="Sign in to LankaCare"
              >
                {state === 'success' ? 'Signing you in…' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1.5rem 0 1.25rem',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              style={{ fontWeight: 700, color: 'var(--teal)', textDecoration: 'none' }}
            >
              Create Account
            </Link>
          </p>

          <p
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            By signing in, you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
