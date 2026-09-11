'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

const schema = z.object({
  identifier: z.string().min(3, 'Please enter your NIC, email, or mobile number'),
});

type FormData = z.infer<typeof schema>;

type State = 'idle' | 'loading' | 'sent' | 'error';

export default function ForgotPasswordPage() {
  const [state, setState]     = useState<State>('idle');
  const [userId, setUserId]   = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.identifier }),
      });
      const json = await res.json();
      if (res.ok) {
        setState('sent');
        setUserId(json.userId || '');
      } else {
        setState('error');
        setErrorMsg(json.error || 'Failed to process request');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please check your connection.');
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
          {state === 'sent' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={32} color="#16A34A" />
              </div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Check Your Contact</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                If an account exists with those details, we&apos;ve sent a 6-digit OTP.
                <br />The OTP is valid for 5 minutes.
              </p>
              <Link
                href={`/verify-account?userId=${userId}&purpose=RESET_PASSWORD`}
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
                Enter OTP →
              </Link>
              <Link href="/login" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Mail size={24} color="var(--teal)" />
                </div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Forgot Password</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Enter your NIC, email, or mobile to receive an OTP
                </p>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}
                >
                  <AlertCircle size={16} color="#DC2626" />
                  <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{errorMsg}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    id="forgot-identifier"
                    label="NIC / Email / Mobile"
                    type="text"
                    placeholder="e.g. 199012345678 or user@email.com"
                    error={errors.identifier?.message}
                    {...register('identifier')}
                  />
                  <Button type="submit" variant="primary" fullWidth size="lg" style={{ borderRadius: 12 }} loading={state === 'loading'}>
                    {state === 'loading' ? 'Sending…' : 'Send OTP'}
                  </Button>
                </div>
              </form>
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Remember your password?{' '}
                <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
