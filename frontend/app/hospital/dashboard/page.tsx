'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Building2, Pill, BedDouble, Droplets, ArrowUpRight, ArrowDownRight,
  Activity, Clock, AlertCircle
} from 'lucide-react';

export default function HospitalDashboardPage() {
  const [hospitalName] = useState('National Hospital of Sri Lanka');

  const stats = [
    { title: 'Today\'s Patients', value: '1,248', trend: '+12%', isUp: true, icon: <Users size={24} color="#0284C7" />, bg: '#E0F2FE' },
    { title: 'Active Clinics', value: '14', trend: 'Same', isUp: true, icon: <Building2 size={24} color="#0D9488" />, bg: '#CCFBF1' },
    { title: 'Low Stock Meds', value: '23', trend: '+5', isUp: false, icon: <Pill size={24} color="#D97706" />, bg: '#FEF3C7' },
    { title: 'Bed Occupancy', value: '88%', trend: '+2%', isUp: false, icon: <BedDouble size={24} color="#7C3AED" />, bg: '#F5F3FF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Hospital Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to the admin panel for {hospitalName}</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} /> Last synced: Just now
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="lc-card"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 999, background: stat.isUp ? '#ECFDF5' : '#FEF2F2', color: stat.isUp ? '#059669' : '#DC2626' }}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.375rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {stat.title}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Critical Alerts */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lc-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="#DC2626" /> Action Required
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#FEF2F2', borderRadius: 12, border: '1px solid #FEE2E2' }}>
              <Droplets size={24} color="#DC2626" />
              <div>
                <div style={{ fontWeight: 600, color: '#991B1B', fontSize: '0.9375rem' }}>O- Negative Blood Critical</div>
                <div style={{ fontSize: '0.8125rem', color: '#B91C1C' }}>Current stock level is below 10%. Triggering donor alerts.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#FFF7ED', borderRadius: 12, border: '1px solid #FED7AA' }}>
              <Pill size={24} color="#D97706" />
              <div>
                <div style={{ fontWeight: 600, color: '#92400E', fontSize: '0.9375rem' }}>Frusemide 40mg Out of Stock</div>
                <div style={{ fontSize: '0.8125rem', color: '#B45309' }}>Pharmacy reported stock depletion today. Requesting from MSD.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Queue Bottlenecks */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lc-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--teal)" /> Active Queue Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Cardiology (Room 4)', wait: '45 mins', serving: 14, total: 60, status: 'High Volume' },
              { name: 'ENT Clinic (Room 2)', wait: '15 mins', serving: 32, total: 40, status: 'Normal' },
              { name: 'Eye Clinic (Room 12)', wait: '60 mins', serving: 8, total: 85, status: 'Severe Delay' },
            ].map(q => (
              <div key={q.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{q.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Serving: {q.serving} / {q.total} • Est. Wait: {q.wait}</div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 999, background: q.status === 'Severe Delay' ? '#FEF2F2' : q.status === 'High Volume' ? '#FFF7ED' : '#F0FDF4', color: q.status === 'Severe Delay' ? '#DC2626' : q.status === 'High Volume' ? '#D97706' : '#16A34A' }}>
                  {q.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
