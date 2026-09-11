'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, CheckCircle2, Clock, Activity, AlertTriangle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function LabDashboard() {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ [key: string]: { summary: string; interpretation: string } }>({});

  useEffect(() => {
    // MOCK hospitalId for demo
    const hospitalId = 'mock-hospital-id';
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

    const fetchPending = () => {
      fetch(`${API}/api/v1/lab/hospital/${hospitalId}/pending`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLabTests(data.data);
            
            // Initialize result state for each test
            const initialResults: any = {};
            data.data.forEach((test: any) => {
              if (!results[test._id]) {
                initialResults[test._id] = { summary: '', interpretation: 'Normal' };
              }
            });
            setResults(prev => ({ ...prev, ...initialResults }));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchPending();

    // Initialize Socket.IO connection
    const socket: Socket = io(API, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Lab Tech connected to WebSocket');
      socket.emit('join_hospital', hospitalId);
    });

    socket.on('lab_queue_updated', (data) => {
      console.log('Lab queue update:', data);
      fetchPending();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleResultChange = (testId: string, field: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [testId]: { ...prev[testId], [field]: value }
    }));
  };

  const handleComplete = async (testId: string) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const resultData = results[testId];

      if (!resultData.summary) {
        alert('Please enter a result summary.');
        return;
      }

      const res = await fetch(`${API}/api/v1/lab/tests/${testId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultSummary: resultData.summary,
          interpretation: resultData.interpretation
        }),
        credentials: 'include'
      });

      if (res.ok) {
        alert('Lab result saved and completed.');
        setLabTests(prev => prev.filter(t => t._id !== testId));
      } else {
        alert('Failed to complete lab test (or you are not logged in as LAB_TECH).');
      }
    } catch (e) {
      alert('Error completing lab test');
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Blood': return { bg: '#fee2e2', text: '#b91c1c' }; // Red
      case 'Urine': return { bg: '#fef9c3', text: '#a16207' }; // Yellow
      case 'Imaging': return { bg: '#e0e7ff', text: '#4338ca' }; // Indigo
      default: return { bg: '#f3f4f6', text: '#374151' }; // Gray
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: '#2563eb', padding: '0.75rem', borderRadius: 12 }}>
          <TestTube size={28} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pathology & Lab</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live Diagnostics Queue</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading pending tests...</div>
        ) : labTests.length === 0 ? (
          <div className="lc-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={48} color="#2563eb" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Queue is Empty</h3>
            <p>All pending lab tests have been completed.</p>
          </div>
        ) : (
          labTests.map((test, idx) => {
            const catColors = getCategoryColor(test.category);
            const r = results[test._id] || { summary: '', interpretation: 'Normal' };

            return (
              <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="lc-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{test.testName}</div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} /> Ordered: {new Date(test.dateOrdered).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ padding: '0.25rem 0.75rem', backgroundColor: catColors.bg, color: catColors.text, borderRadius: 20, fontSize: '0.875rem', fontWeight: 700 }}>
                    {test.category}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Result Summary</label>
                    <textarea 
                      value={r.summary}
                      onChange={(e) => handleResultChange(test._id, 'summary', e.target.value)}
                      placeholder="Enter the lab results here (e.g., WBC 12.5 x 10^9/L, RBC 4.2 x 10^12/L)"
                      style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Interpretation</label>
                    <select 
                      value={r.interpretation}
                      onChange={(e) => handleResultChange(test._id, 'interpretation', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Abnormal">Abnormal</option>
                      <option value="Critical">Critical</option>
                    </select>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: r.interpretation === 'Critical' ? '#fef2f2' : 'var(--bg-soft)', borderRadius: 8, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <Activity size={20} color={r.interpretation === 'Critical' ? '#ef4444' : 'var(--text-secondary)'} />
                      <div style={{ fontSize: '0.875rem', color: r.interpretation === 'Critical' ? '#ef4444' : 'var(--text-secondary)', fontWeight: r.interpretation === 'Critical' ? 700 : 400 }}>
                        {r.interpretation === 'Critical' ? 'Critical results must be reported immediately.' : 'Standard processing time applies.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} /> Mark Invalid Sample
                  </Button>
                  <Button variant="primary" onClick={() => handleComplete(test._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} /> Complete & Send to Doctor
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
