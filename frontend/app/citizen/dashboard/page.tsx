'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, HeartPulse, FileText, ArrowRight,
  AlertCircle, Activity, Stethoscope, Loader2
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';

interface DashboardData {
  user: {
    firstName: string;
    lastName: string;
    nic: string;
    bloodGroup?: string;
  };
  upcomingAppointments: any[];
  activeQueues: any[];
  recentPrescriptions: any[];
}

export default function CitizenDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API}/api/v1/auth/me`, { credentials: 'include' });
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        
        // Mocking the dashboard specific data for now as the endpoint isn't fully returning these yet
        setData({
          user: {
            firstName: json.citizen?.firstName || 'Citizen',
            lastName: json.citizen?.lastName || '',
            nic: json.user?.nic || 'NIC verified',
            bloodGroup: json.citizen?.bloodGroup || 'Not specified',
          },
          upcomingAppointments: [],
          activeQueues: [],
          recentPrescriptions: [],
        });
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [API]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Skeleton height={80} borderRadius={16} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height={200} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem' }} role="alert">
        <AlertCircle size={20} color="#DC2626" />
        <span style={{ color: '#991B1B', fontWeight: 500 }}>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, var(--teal) 0%, #0369A1 100%)',
          borderRadius: 20,
          padding: '2rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(13, 148, 136, 0.2)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Ayubowan, {data?.user.firstName}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', maxWidth: 500 }}>
            Welcome to your digital health portal. Manage your appointments, track queue status, and access your health records.
          </p>
        </div>
        <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, zIndex: 1 }}>
          <HeartPulse size={160} />
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Appointments Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lc-card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--teal)" /> Upcoming Appointments
            </h2>
            <Link href="/citizen/appointments" style={{ fontSize: '0.875rem', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {data?.upcomingAppointments.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>No upcoming appointments</p>
              <Link href="/citizen/appointments/new" style={{ padding: '0.5rem 1rem', background: 'var(--teal-soft)', color: 'var(--teal)', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
                Book Appointment
              </Link>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Render upcoming appointments here */}
            </div>
          )}
        </motion.div>

        {/* Live Queue Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lc-card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#D97706" /> Live Queue Status
            </h2>
          </div>

          {data?.activeQueues.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', textAlign: 'center' }}>You are not currently in any hospital queue.</p>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              {/* Render active queues */}
            </div>
          )}
        </motion.div>

      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '1rem' }}>Quick Access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {[
          { href: '/citizen/appointments/new', label: 'Book Appointment', icon: <Calendar size={20} />, desc: 'Schedule a visit to a clinic', color: 'var(--teal)' },
          { href: '/hospitals', label: 'Find a Hospital', icon: <Stethoscope size={20} />, desc: 'Search nearby hospitals', color: '#0369A1' },
          { href: '/citizen/prescriptions', label: 'My Prescriptions', icon: <FileText size={20} />, desc: 'View current medications', color: '#7C3AED' },
          { href: '/citizen/health-wallet', label: 'Health Wallet', icon: <HeartPulse size={20} />, desc: 'Access lab results & records', color: '#DC2626' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="lc-card"
            style={{ padding: '1.25rem', display: 'flex', gap: '1rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', alignItems: 'center' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {action.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{action.label}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
