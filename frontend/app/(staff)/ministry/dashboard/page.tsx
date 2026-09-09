'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Stethoscope, Pill, Activity, TrendingUp } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function MinistryDashboard() {
  const [stats, setStats] = useState({
    totalPatientsToday: 0,
    liveConsultations: 0,
    totalDispensedPrescriptions: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Fetch initial stats
    fetch(`${API}/api/v1/ministry/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Initialize Socket.IO connection
    const socket: Socket = io(API, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Ministry connected to WebSocket');
      socket.emit('join_ministry');
    });

    socket.on('ministry_metrics_updated', (payload) => {
      console.log('Ministry metric update:', payload);
      const { type } = payload;
      
      setStats(prev => {
        const next = { ...prev };
        
        switch (type) {
          case 'PATIENT_CHECKED_IN':
            next.totalPatientsToday += 1;
            break;
          case 'CONSULTATION_STARTED':
            // If we tracked started, we'd increment live consultations here
            break;
          case 'CONSULTATION_COMPLETED':
            next.liveConsultations = Math.max(0, next.liveConsultations - 1);
            break;
          case 'PRESCRIPTION_CREATED':
            // Could track pending prescriptions
            break;
          case 'PRESCRIPTION_DISPENSED':
            next.totalDispensedPrescriptions += 1;
            break;
        }
        return next;
      });
      
      // To ensure accuracy, we might refetch full stats on certain events or debounced
      fetch(`${API}/api/v1/ministry/stats`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setStats(data.data);
        });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: '#dc2626', padding: '0.75rem', borderRadius: 12 }}>
          <ShieldAlert size={28} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>National Command Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ministry of Health - Live Analytics</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading national statistics...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="lc-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)' }}>
            <div style={{ backgroundColor: '#0ea5e9', padding: '1rem', borderRadius: 16 }}>
              <Users size={32} color="white" />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Patients In System Today</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{stats.totalPatientsToday}</div>
                <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}><TrendingUp size={16} /> Live</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lc-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
            <div style={{ backgroundColor: '#ef4444', padding: '1rem', borderRadius: 16 }}>
              <Stethoscope size={32} color="white" />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Active Consultations</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{stats.liveConsultations}</div>
                <div style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={16} /> Live</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lc-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
            <div style={{ backgroundColor: '#10b981', padding: '1rem', borderRadius: 16 }}>
              <Pill size={32} color="white" />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Prescriptions Dispensed</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{stats.totalDispensedPrescriptions}</div>
                <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}><TrendingUp size={16} /> Live</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="lc-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Geographic Heatmap (Placeholder)</h2>
        <div style={{ height: 400, backgroundColor: 'var(--bg-soft)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          Map integration showing hot-zones of disease outbreaks will appear here.
        </div>
      </div>
    </div>
  );
}
