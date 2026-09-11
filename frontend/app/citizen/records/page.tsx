'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Hospital as HospitalIcon, Stethoscope, ChevronRight } from 'lucide-react';
import { Button } from '@/components/Button';

export default function MyHealthRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
    
    // Fetch my health records
    fetch(`${API}/api/v1/health-records/my-history`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--teal)', padding: '0.75rem', borderRadius: 12 }}>
          <FileText size={28} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Medical History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your permanent digital health passport</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Timeline List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading your records...</div>
          ) : records.length === 0 ? (
            <div className="lc-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No medical history found.
            </div>
          ) : (
            records.map((record, idx) => (
              <motion.div 
                key={record._id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedRecord(record)}
                className="lc-card" 
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer',
                  borderLeft: selectedRecord?._id === record._id ? '4px solid var(--teal)' : '4px solid transparent',
                  backgroundColor: selectedRecord?._id === record._id ? 'var(--bg-soft)' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{new Date(record.recordDate).toLocaleDateString()}</div>
                  <ChevronRight size={16} color="var(--text-secondary)" />
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '0.5rem' }}>
                  {record.diagnosis}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <HospitalIcon size={14} /> {record.hospitalId?.officialName || 'Unknown Hospital'}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Record Detail View */}
        <div>
          {selectedRecord ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {selectedRecord.diagnosis}
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {new Date(selectedRecord.recordDate).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Stethoscope size={14} /> Dr. {selectedRecord.doctorId?.firstName} {selectedRecord.doctorId?.lastName}</span>
                  </div>
                </div>
                <Button variant="secondary" style={{ fontSize: '0.875rem' }}>Download PDF</Button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem' }}>Presenting Symptoms</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedRecord.symptoms?.map((sym: string, i: number) => (
                    <span key={i} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: 20, fontSize: '0.875rem', fontWeight: 600 }}>
                      {sym}
                    </span>
                  ))}
                  {(!selectedRecord.symptoms || selectedRecord.symptoms.length === 0) && <span style={{ color: 'var(--text-secondary)' }}>None recorded</span>}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem' }}>Clinical Notes</h3>
                <div style={{ backgroundColor: 'var(--bg-soft)', padding: '1.5rem', borderRadius: 8, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedRecord.clinicalNotes || 'No notes provided.'}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem' }}>Treatment Plan</h3>
                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1.5rem', borderRadius: 8, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedRecord.treatmentPlan || 'No specific treatment plan provided.'}
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="lc-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <FileText size={48} color="var(--border)" />
              <div>Select a health record from the timeline to view details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
