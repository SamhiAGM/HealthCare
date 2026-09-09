'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function DoctorQueue() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // We would dynamically fetch the doctor's assigned clinic ID here in a real scenario
    const clinicId = 'mock-clinic-id'; 
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Fetch initial queue state
    // (mocking the fetch for now as the specific route for fetching a clinic's queue might need adjustments)
    fetch(`${API}/api/v1/queue/live/mock-hospital-id/mock-dept-id`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Mock data structure until we build the specific doctor queue API
        setTokens([
          { _id: '1', tokenNumber: 'C-001', status: 'Waiting', citizenId: 'user1' },
          { _id: '2', tokenNumber: 'C-002', status: 'Waiting', citizenId: 'user2' }
        ]);
        setLoading(false);
      });

    // Initialize Socket.IO connection
    const socket: Socket = io(API, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      socket.emit('join_clinic', clinicId);
    });

    socket.on('queue_updated', (data) => {
      console.log('Queue real-time update received:', data);
      // In a full implementation, we'd refetch the queue or optimistically update the state
      // For now, we simulate an optimistic add/update
      setTokens(prev => {
        const exists = prev.find(t => t.tokenNumber === data.tokenNumber);
        if (exists) {
          return prev.map(t => t.tokenNumber === data.tokenNumber ? { ...t, status: 'Waiting' } : t);
        }
        return [...prev, { _id: data.queueTokenId, tokenNumber: data.tokenNumber, status: 'Waiting', citizenId: 'unknown' }];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCallNext = () => {
    // In real implementation, calls API /api/v1/queue/:id/advance with action="Call"
    alert("Calling next patient...");
  };

  const handleStartConsultation = (appointmentId: string) => {
    // Note: The appointmentId should come from the queue token
    // For now we route to a generic ID
    router.push(`/doctor/consultation/mock-appointment-id`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Clock size={24} color="var(--teal)" /> Live Queue Operations
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your clinic queue, call tokens, and handle walk-ins.</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar / List */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Queues</h2>
          <div
            style={{
              padding: '1.25rem', background: 'var(--teal-soft)',
              border: `2px solid var(--teal)`,
              borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Medical Clinic</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, background: '#ECFDF5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: 999 }}>Active</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span>Serving: <strong>{tokens.length > 0 ? tokens[0].tokenNumber.replace('C-', '') : '0'}</strong></span>
              <span>Waiting: {Math.max(0, tokens.length - 1)}</span>
            </div>
            <div style={{ marginTop: '0.75rem', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--teal)', width: `50%` }} />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="lc-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Medical Clinic</h2>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} /> {Math.max(0, tokens.length - 1)} Patients Waiting
                </div>
              </div>
              <Button variant="secondary" onClick={() => handleStartConsultation(tokens.length > 0 ? tokens[0]._id : '')} disabled={tokens.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlayCircle size={16} /> Open Consultation
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Currently Serving</div>
              <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1, marginBottom: '0.5rem' }}>
                {tokens.length > 0 ? tokens[0].tokenNumber.replace('C-', '') : '--'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                {tokens.length > 0 ? `Ticket: ${tokens[0].tokenNumber}` : 'No active patient'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Button onClick={() => alert("Marked as No Show")} style={{ background: '#F3F4F6', color: '#4B5563', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', height: 'auto' }}>
                <CheckCircle size={24} style={{ opacity: 0.5 }} /> No Show
              </Button>
              <Button onClick={handleCallNext} style={{ background: 'var(--teal)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', height: 'auto' }}>
                <PlayCircle size={24} /> Call Next ({Math.max(0, tokens.length - 1)})
              </Button>
              <Button onClick={() => alert("Marked as Complete")} style={{ background: '#16A34A', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', height: 'auto' }}>
                <CheckCircle size={24} /> Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
