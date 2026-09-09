'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, UserPlus, Play, CheckSquare, SkipForward, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';

export default function HospitalQueuePage() {
  const [activeClinic, setActiveClinic] = useState('Cardiology Clinic');

  const queues = [
    { clinic: 'Cardiology Clinic', serving: 14, total: 60, waiting: 46, status: 'Active' },
    { clinic: 'ENT Clinic', serving: 32, total: 40, waiting: 8, status: 'Active' },
    { clinic: 'Eye Clinic', serving: 8, total: 85, waiting: 77, status: 'Delayed' },
  ];

  const [currentServing, setCurrentServing] = useState(14);
  const [waiting, setWaiting] = useState(46);

  const handleCallNext = () => {
    if (waiting > 0) {
      setCurrentServing(prev => prev + 1);
      setWaiting(prev => prev - 1);
      alert(`Calling Ticket C-${String(currentServing + 1).padStart(3, '0')} via PA System!`);
    } else {
      alert("No more patients waiting in this clinic.");
    }
  };

  const handleComplete = () => {
    alert(`Ticket C-${String(currentServing).padStart(3, '0')} marked as Completed.`);
  };

  const handleNoShow = () => {
    alert(`Ticket C-${String(currentServing).padStart(3, '0')} marked as No Show.`);
    if (waiting > 0) {
      setCurrentServing(prev => prev + 1);
      setWaiting(prev => prev - 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={24} color="var(--teal)" /> Live Queue Operations
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage physical clinic queues, call tokens, and handle walk-ins.</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar / List */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Today&apos;s Queues</h2>
          {queues.map(q => (
            <div
              key={q.clinic}
              onClick={() => setActiveClinic(q.clinic)}
              style={{
                padding: '1.25rem', background: activeClinic === q.clinic ? 'var(--teal-soft)' : 'var(--bg-card)',
                border: `2px solid ${activeClinic === q.clinic ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{q.clinic}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, background: q.status === 'Active' ? '#ECFDF5' : '#FEF2F2', color: q.status === 'Active' ? '#059669' : '#DC2626', padding: '0.25rem 0.5rem', borderRadius: 999 }}>{q.status}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Serving: <strong>{q.serving}</strong></span>
                <span>Waiting: {q.waiting}</span>
              </div>
              <div style={{ marginTop: '0.75rem', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--teal)', width: `${(q.serving / q.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Control Panel */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="lc-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{activeClinic}</h2>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} /> {waiting} Patients Waiting
                </div>
              </div>
              <Button variant="secondary" onClick={() => { setWaiting(w => w + 1); alert("Walk-in patient added to queue."); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={16} /> Add Walk-in
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Currently Serving</div>
              <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1, marginBottom: '0.5rem' }}>{currentServing}</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Ticket: C-{String(currentServing).padStart(3, '0')}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Button onClick={handleNoShow} style={{ background: '#F3F4F6', color: '#4B5563', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', height: 'auto' }}>
                <SkipForward size={24} /> No Show
              </Button>
              <Button onClick={handleCallNext} style={{ background: 'var(--teal)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', height: 'auto' }}>
                <Play size={24} /> Call Next ({waiting})
              </Button>
              <Button onClick={handleComplete} style={{ background: '#16A34A', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', height: 'auto' }}>
                <CheckSquare size={24} /> Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
