'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, Droplets, Ruler, Weight, User, FileText, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/Button';

export default function HealthWalletPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'records'>('overview');

  const profile = {
    bloodGroup: 'O+',
    height: '175 cm',
    weight: '70 kg',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['None'],
  };

  const records = [
    { id: '1', date: '2026-08-15', type: 'Lab Report', title: 'Full Blood Count', hospital: 'National Hospital of Sri Lanka' },
    { id: '2', date: '2026-05-20', type: 'Discharge Summary', title: 'Post-Surgery Summary', hospital: 'Teaching Hospital Karapitiya' },
    { id: '3', date: '2026-01-10', type: 'Imaging', title: 'Chest X-Ray', hospital: 'District General Hospital Gampaha' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartPulse size={24} color="var(--teal)" /> Health Wallet
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your consolidated personal medical records and health profile.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: `2.5px solid ${activeTab === 'overview' ? 'var(--teal)' : 'transparent'}`, color: activeTab === 'overview' ? 'var(--teal)' : 'var(--text-secondary)', fontWeight: activeTab === 'overview' ? 700 : 500, cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          Health Profile
        </button>
        <button
          onClick={() => setActiveTab('records')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: `2.5px solid ${activeTab === 'records' ? 'var(--teal)' : 'transparent'}`, color: activeTab === 'records' ? 'var(--teal)' : 'var(--text-secondary)', fontWeight: activeTab === 'records' ? 700 : 500, cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          Medical Records
        </button>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Vitals & Demographics */}
          <div className="lc-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--teal)" /> Basic Metrics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Droplets size={14} /> Blood Group</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626' }}>{profile.bloodGroup}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Ruler size={14} /> Height</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.height}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Weight size={14} /> Weight</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.weight}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14} /> BMI</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>22.9</div>
              </div>
            </div>
            <Button variant="outline" size="sm" style={{ width: '100%', marginTop: '1.5rem' }}>Update Metrics</Button>
          </div>

          {/* Medical Alerts */}
          <div className="lc-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} color="#D97706" /> Alerts & Conditions
            </h2>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Allergies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.allergies.map(a => (
                  <span key={a} style={{ padding: '0.25rem 0.75rem', background: '#FEF2F2', color: '#DC2626', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600 }}>{a}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Chronic Conditions</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.chronicConditions.map(c => (
                  <span key={c} style={{ padding: '0.25rem 0.75rem', background: 'var(--bg-soft)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600 }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'records' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="search" className="lc-input" placeholder="Search records..." style={{ paddingLeft: '2.5rem' }} />
            </div>
            <select className="lc-input" style={{ width: 'auto' }}>
              <option>All Types</option>
              <option>Lab Reports</option>
              <option>Discharge Summaries</option>
              <option>Imaging</option>
            </select>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {records.map((r, i) => (
              <div key={r.id} style={{ padding: '1.25rem', borderBottom: i === records.length - 1 ? 'none' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{r.type}</span> • {r.hospital}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{new Date(r.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
