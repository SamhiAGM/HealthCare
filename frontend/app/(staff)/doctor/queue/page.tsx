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
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live Queue Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Today's patients for Medical Clinic</p>
        </div>
        <Button variant="primary" onClick={handleCallNext} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlayCircle size={18} /> Call Next Patient
        </Button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading queue...</div>
        ) : tokens.length === 0 ? (
          <div className="lc-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No patients waiting in the queue.
          </div>
        ) : (
          tokens.map((token, idx) => (
            <motion.div key={token._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="lc-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)', minWidth: '100px' }}>
                  {token.tokenNumber}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Patient ID: {token.citizenId}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Clock size={14} /> Status: {token.status}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm">View Profile</Button>
                <Button variant="primary" size="sm" onClick={() => handleStartConsultation('mock-id')} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <PlayCircle size={14} /> Open Consultation
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
