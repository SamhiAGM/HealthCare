'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function ReceptionDashboard() {
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tokenDetails, setTokenDetails] = useState<any>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentNumber) return;

    setLoading(true);
    setMessage(null);
    setTokenDetails(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/queue/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentNumber, qrCode: 'bypass' }), // Bypassing QR for manual entry
        credentials: 'include'
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Patient successfully checked in!' });
        setTokenDetails(data.data);
        setAppointmentNumber('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to check in patient.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'A network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Reception Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Verify appointments and manage patient check-ins.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Check-in Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={24} color="var(--teal)" /> Patient Check-In
          </h2>

          <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input 
              label="Appointment Number" 
              id="apt-number" 
              placeholder="e.g. APT-20261012-4829" 
              value={appointmentNumber}
              onChange={(e) => setAppointmentNumber(e.target.value)}
              required
            />
            
            {message && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: 8, 
                backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: message.type === 'success' ? '#047857' : '#B91C1C',
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500
              }}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            {tokenDetails && (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Generated Queue Token</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--teal)', lineHeight: 1 }}>{tokenDetails.tokenNumber}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>Status: {tokenDetails.status}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit" variant="primary" loading={loading} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> Verify & Check-In
              </Button>
              <Button type="button" variant="secondary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={18} /> Scan QR Code
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
