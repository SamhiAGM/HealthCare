'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/Button';

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we fetch the hospitalId from the logged-in user's session
    const hospitalId = 'mock-hospital-id';
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

    // Fetch initial pending prescriptions
    // Using a mocked generic hospital ID for now, since we haven't wired full auth
    fetch(`${API}/api/v1/pharmacy/hospital/${hospitalId}/pending`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrescriptions(data.data);
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
      console.log('Pharmacy connected to WebSocket');
      socket.emit('join_hospital', hospitalId);
    });

    socket.on('pharmacy_queue_updated', (data) => {
      console.log('Pharmacy queue update:', data);
      // In a real implementation we would fetch the new prescription details
      // For this prototype, we'll refetch all pending
      fetch(`${API}/api/v1/pharmacy/hospital/${hospitalId}/pending`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPrescriptions(data.data);
          }
        });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleDispense = async (id: string) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/pharmacy/prescriptions/${id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'Dispense' }),
        credentials: 'include'
      });

      if (res.ok) {
        alert('Prescription Dispensed successfully.');
        setPrescriptions(prev => prev.filter(p => p._id !== id));
      } else {
        alert('Failed to dispense (or you are not logged in as Pharmacist).');
      }
    } catch (e) {
      alert('Error dispensing prescription');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--teal)', padding: '0.75rem', borderRadius: 12 }}>
          <Pill size={28} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pharmacy Operations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live Prescription Queue</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading pending prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="lc-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Queue is Empty</h3>
            <p>All pending prescriptions have been dispensed.</p>
          </div>
        ) : (
          prescriptions.map((rx, idx) => (
            <motion.div key={rx._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="lc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{rx.prescriptionNumber}</div>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Clock size={16} /> Issued: {new Date(rx.issueDate).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 20, fontSize: '0.875rem', fontWeight: 700 }}>
                  PENDING
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-soft)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Medicine</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Dosage & Freq</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Quantity to Dispense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.items.map((item: any, i: number) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{item.medicineName}</td>
                        <td style={{ padding: '1rem' }}>{item.dosage} - {item.frequency}</td>
                        <td style={{ padding: '1rem' }}>{item.durationDays} days</td>
                        <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--teal)' }}>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> Mark Out of Stock
                </Button>
                <Button variant="primary" onClick={() => handleDispense(rx._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Dispense Medicine
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
