'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Building2, AlertCircle, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Will connect to actual endpoint in Phase 7 implementation
        // const res = await fetch(`${API}/api/v1/citizen/appointments`, { credentials: 'include' });
        // if (!res.ok) throw new Error('Failed to fetch');
        // const json = await res.json();
        // setAppointments(json.appointments);
        
        // Simulating delay for mockup
        await new Promise(r => setTimeout(r, 600));
        setAppointments([]); 
      } catch {
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [API]);

  const upcoming = appointments.filter(a => ['Scheduled', 'Confirmed', 'Arrived', 'In Queue'].includes(a.status));
  const past = appointments.filter(a => ['Completed', 'Cancelled', 'No Show'].includes(a.status));
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Appointments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your clinic visits and view e-tickets</p>
        </div>
        <Link href="/citizen/appointments/new" style={{ padding: '0.625rem 1.25rem', background: 'var(--teal)', color: 'white', borderRadius: 10, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} /> Book New
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: `2.5px solid ${activeTab === 'upcoming' ? 'var(--teal)' : 'transparent'}`, color: activeTab === 'upcoming' ? 'var(--teal)' : 'var(--text-secondary)', fontWeight: activeTab === 'upcoming' ? 700 : 500, cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: `2.5px solid ${activeTab === 'past' ? 'var(--teal)' : 'transparent'}`, color: activeTab === 'past' ? 'var(--teal)' : 'var(--text-secondary)', fontWeight: activeTab === 'past' ? 700 : 500, cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          Past ({past.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={120} borderRadius={12} />)}
        </div>
      ) : error ? (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem' }} role="alert">
          <AlertCircle size={20} color="#DC2626" />
          <span style={{ color: '#991B1B', fontWeight: 500 }}>{error}</span>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16 }}>
          <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>No {activeTab} appointments</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You don&apos;t have any {activeTab} clinic visits scheduled.</p>
          {activeTab === 'upcoming' && (
            <Link href="/citizen/appointments/new" style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-soft)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>
              Book an Appointment
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {displayed.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/citizen/appointments/${apt._id}`}
                className="lc-card"
                style={{ display: 'block', padding: '1.25rem', textDecoration: 'none', transition: 'box-shadow 0.2s', borderLeft: `4px solid ${getStatusColor(apt.status)}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{new Date(apt.appointmentDate).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 999, background: `${getStatusColor(apt.status)}15`, color: getStatusColor(apt.status) }}>
                        {apt.status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{apt.clinicId?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                      <Building2 size={14} /> {apt.hospitalId?.officialName}
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" style={{ marginTop: '0.5rem' }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Scheduled':
    case 'Confirmed': return '#0369A1';
    case 'Arrived':
    case 'In Queue': return '#D97706';
    case 'Completed': return '#16A34A';
    case 'Cancelled':
    case 'No Show': return '#DC2626';
    default: return '#6B7280';
  }
}
