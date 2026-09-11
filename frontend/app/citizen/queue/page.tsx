'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, AlertCircle, Volume2, Building2, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';

export default function QueueTrackerPage() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

  const fetchQueues = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // Simulating data for mockup
      await new Promise(r => setTimeout(r, 600));
      setQueues([
        {
          _id: 'q1',
          tokenNumber: 42,
          status: 'Waiting',
          currentServing: 38,
          estimatedWaitMinutes: 25,
          clinicId: { name: 'Cardiology Clinic' },
          hospitalId: { officialName: 'National Hospital of Sri Lanka', district: 'Colombo' },
          date: new Date().toISOString()
        }
      ]);
    } catch {
      setError('Failed to load active queues.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    // In production, this would be a WebSocket or SSE connection
    const interval = setInterval(() => fetchQueues(true), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Live Queue Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your position in the clinic queue in real-time.</p>
        </div>
        <button
          onClick={() => fetchQueues(true)}
          disabled={loading || refreshing}
          style={{ padding: '0.5rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; }`}</style>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Array.from({ length: 1 }).map((_, i) => <Skeleton key={i} height={300} borderRadius={20} />)}
        </div>
      ) : error ? (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem' }} role="alert">
          <AlertCircle size={20} color="#DC2626" />
          <span style={{ color: '#991B1B', fontWeight: 500 }}>{error}</span>
        </div>
      ) : queues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16 }}>
          <Clock size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Not in a queue</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto' }}>
            You are not currently checked into any clinic queues. When you arrive at the hospital and check in, your token will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <AnimatePresence>
            {queues.map((q) => (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lc-card"
                style={{ overflow: 'hidden' }}
              >
                {/* Header */}
                <div style={{ background: 'var(--teal)', color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{q.clinicId.name}</h2>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                      <Building2 size={14} /> {q.hospitalId.officialName}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.375rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
                    LIVE
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Your Token</div>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{q.tokenNumber}</div>
                    <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#FEF3C7', color: '#D97706', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                      WAITING
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Currently Serving</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{q.currentServing}</div>
                    
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Est. Wait Time</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                        <Clock size={18} color="var(--teal)" /> ~{q.estimatedWaitMinutes} mins
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Alert */}
                {q.tokenNumber - q.currentServing <= 5 && q.tokenNumber > q.currentServing && (
                  <div style={{ background: '#FEF2F2', padding: '1rem 1.5rem', borderTop: '1px solid #FEE2E2', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Volume2 size={20} color="#DC2626" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991B1B' }}>Your turn is approaching!</div>
                      <div style={{ fontSize: '0.8125rem', color: '#B91C1C' }}>Please proceed to the clinic waiting area. There are only {q.tokenNumber - q.currentServing - 1} people ahead of you.</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
