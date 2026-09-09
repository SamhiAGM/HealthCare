'use client';

import { motion } from 'framer-motion';
import { Stethoscope, Users, Calendar, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Good Morning, Doctor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Medical Department, Base Hospital Kinniya</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Quick Stats */}
        <div className="lc-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--teal)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Today's Appointments</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>42</div>
        </div>
        <div className="lc-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Waiting Queue</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>14</div>
        </div>
        <div className="lc-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Completed</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>28</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Users size={20} color="var(--teal)" /> Queue Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>View the live patient queue and begin consultations.</p>
          <button 
            onClick={() => router.push('/doctor/queue')}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--teal)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            Open Live Queue
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lc-card" style={{ padding: '2rem' }}>
           <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <AlertCircle size={20} color="#f59e0b" /> Pending Tasks
           </h2>
           <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ padding: '1rem', backgroundColor: 'var(--bg-soft)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9375rem' }}>
                <div style={{ fontWeight: 600 }}>Lab Results Ready</div>
                <div style={{ color: 'var(--text-secondary)' }}>2 Urgent CBC results waiting for review</div>
              </li>
           </ul>
        </motion.div>
      </div>
    </div>
  );
}
