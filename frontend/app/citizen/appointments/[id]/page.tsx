'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar, Clock, MapPin, Building2, ChevronLeft,
  AlertCircle, Download, FileText, CheckCircle, XCircle
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Will connect to actual endpoint in Phase 7 implementation
        // const res = await fetch(`${API}/api/v1/citizen/appointments/${id}`, { credentials: 'include' });
        // if (!res.ok) throw new Error('Failed to fetch');
        // const json = await res.json();
        // setAppointment(json.appointment);
        
        // Simulating data for mockup
        await new Promise(r => setTimeout(r, 600));
        setAppointment({
          _id: id,
          qrCodeToken: `LANKACARE-APT-${id.slice(-6).toUpperCase()}`,
          appointmentDate: new Date().toISOString(),
          status: 'Scheduled',
          estimatedTime: '10:30 AM',
          hospitalId: { officialName: 'National Hospital of Sri Lanka', district: 'Colombo' },
          clinicId: { name: 'Cardiology Clinic' },
        });
      } catch {
        setError('Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, API]);

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height={24} width="30%" />
        <Skeleton height={400} borderRadius={20} />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem', maxWidth: 600, margin: '0 auto' }} role="alert">
        <AlertCircle size={20} color="#DC2626" />
        <span style={{ color: '#991B1B', fontWeight: 500 }}>{error || 'Appointment not found'}</span>
      </div>
    );
  }

  const isUpcoming = ['Scheduled', 'Confirmed'].includes(appointment.status);

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <Link href="/citizen/appointments" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ChevronLeft size={16} /> Back to Appointments
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ background: isUpcoming ? 'var(--teal)' : 'var(--bg-muted)', color: isUpcoming ? 'white' : 'var(--text-primary)', padding: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>e-Ticket</h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.25rem' }}>Present this QR code at the hospital reception</p>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 16, border: '1px solid var(--border)', display: 'inline-block', marginBottom: '0.75rem' }}>
              <QRCodeSVG value={appointment.qrCodeToken} size={180} level="H" />
            </div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              {appointment.qrCodeToken}
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 999, background: isUpcoming ? '#E0F2FE' : '#F3F4F6', color: isUpcoming ? '#0369A1' : '#4B5563' }}>
                STATUS: {appointment.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '0 -2rem 2rem' }} />

          {/* Details */}
          <dl style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: 0 }}>
            <div>
              <dt style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Patient</dt>
              <dd style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Logged in Citizen</dd>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <dt style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Date</dt>
                <dd style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar size={16} color="var(--teal)" />
                  {new Date(appointment.appointmentDate).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Est. Time</dt>
                <dd style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock size={16} color="var(--teal)" />
                  {appointment.estimatedTime || 'TBD'}
                </dd>
              </div>
            </div>

            <div>
              <dt style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Clinic</dt>
              <dd style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText size={16} color="var(--teal)" />
                {appointment.clinicId?.name}
              </dd>
            </div>

            <div>
              <dt style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Hospital</dt>
              <dd style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                <Building2 size={16} color="var(--teal)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div>{appointment.hospitalId?.officialName}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.125rem' }}>
                    {appointment.hospitalId?.district}
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </motion.div>
      
      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
        <Button variant="secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Save / Print
        </Button>
        {isUpcoming && (
          <Button variant="danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <XCircle size={16} /> Cancel Visit
          </Button>
        )}
      </div>
    </div>
  );
}
