'use client';

import { motion } from 'framer-motion';
import { Pill, Calendar, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/Button';

export default function PrescriptionsPage() {
  const activePrescriptions = [
    { id: 'p1', medicine: 'Metformin Hydrochloride', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', remaining: 12, doctor: 'Dr. S. Perera', hospital: 'National Hospital of Sri Lanka', date: '2026-08-20' },
    { id: 'p2', medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days', remaining: 12, doctor: 'Dr. S. Perera', hospital: 'National Hospital of Sri Lanka', date: '2026-08-20' },
  ];

  const pastPrescriptions = [
    { id: 'p3', medicine: 'Amoxicillin', dosage: '500mg', frequency: 'Three times a day', duration: '5 days', doctor: 'Dr. K. Silva', hospital: 'District General Hospital Gampaha', date: '2026-06-10' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Pill size={24} color="var(--teal)" /> My Prescriptions
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your current medications and past prescriptions.</p>
      </div>

      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Active Medications</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {activePrescriptions.map(p => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--teal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{p.medicine}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{p.dosage} — {p.frequency}</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={14} /> {p.hospital} ({p.doctor})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Issued: {new Date(p.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Supply Remaining</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--teal)' }}>{p.remaining} days</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Past Prescriptions</h2>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {pastPrescriptions.map((p, i) => (
             <div key={p.id} style={{ padding: '1.25rem', borderBottom: i === pastPrescriptions.length - 1 ? 'none' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
               <div>
                 <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{p.medicine} ({p.dosage})</div>
                 <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{p.hospital} — Issued {new Date(p.date).toLocaleDateString()}</div>
               </div>
               <Button variant="outline" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                 Details <ExternalLink size={14} />
               </Button>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
