'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function VerifyAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId') || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'resending' | 'resent'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { setErrorMsg('Please enter all 6 digits'); return; }
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: otpString, purpose: 'VERIFY_ACCOUNT' }),
      });
      const json = await res.json();
      if (res.ok) {
        setState('success');
        setTimeout(() => router.push('/login?verified=true'), 2000);
      } else {
        setState('error');
        setErrorMsg(json.error || 'Invalid OTP');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const handleResend = async () => {
    setState('resending');
    try {
      await fetch(`${API}/api/v1/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, purpose: 'VERIFY_ACCOUNT' }),
      });
      setState('resent');
      setOtp(Array(6).fill(''));
      setTimeout(() => setState('idle'), 30000);
    } catch {
      setState('error');
      setErrorMsg('Failed to resend OTP');
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
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '2.25rem',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          {state === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={32} color="#16A34A" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Account Verified!</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Redirecting you to sign in…</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} color="var(--teal)" />
              </div>
            </motion.div>
          ) : (
            <>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={24} color="var(--teal)" />
              </div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verify Your Account</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                Enter the 6-digit OTP sent to your mobile number or email.
              </p>

              {/* OTP inputs */}
              <div
                style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`OTP digit ${i + 1}`}
                    style={{
                      width: 48,
                      height: 56,
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      border: `2px solid ${digit ? 'var(--teal)' : 'var(--border)'}`,
                      borderRadius: 10,
                      background: 'var(--bg-soft)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 10, padding: '0.625rem 0.875rem', marginBottom: '1rem', textAlign: 'left' }} role="alert">
                  <AlertCircle size={15} color="#DC2626" />
                  <span style={{ fontSize: '0.8125rem', color: '#991B1B' }}>{errorMsg}</span>
                </div>
              )}

              {state === 'resent' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '0.625rem 0.875rem', marginBottom: '1rem', textAlign: 'left' }} role="status">
                  <CheckCircle size={15} color="#16A34A" />
                  <span style={{ fontSize: '0.8125rem', color: '#166534' }}>New OTP sent! Please check your contact.</span>
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                fullWidth
                size="lg"
                style={{ borderRadius: 12, marginBottom: '0.875rem' }}
                loading={state === 'loading'}
                onClick={handleVerify}
                disabled={otp.join('').length !== 6}
              >
                Verify Account
              </Button>

              <button
                type="button"
                onClick={handleResend}
                disabled={state === 'resending' || state === 'resent'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: state === 'resent' ? 'default' : 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--teal)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  margin: '0 auto',
                  opacity: state === 'resent' ? 0.5 : 1,
                }}
              >
                {state === 'resending' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                {state === 'resending' ? 'Sending…' : state === 'resent' ? 'OTP sent!' : "Didn't receive it? Resend OTP"}
              </button>

              <p style={{ marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Back to Sign In</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
