'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Siren, Bed, Droplets, AlertTriangle, Pill } from 'lucide-react';

export default function EmergencyPage() {
  const [surgeModeActive, setSurgeModeActive] = useState(false);

  const { data: beds = [] } = useQuery({
    queryKey: ['emergency-beds'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/beds`, { credentials: 'include' });
      return (await res.json()).data || [];
    },
    refetchInterval: 15000
  });

  const { data: blood = [] } = useQuery({
    queryKey: ['emergency-blood'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/blood`, { credentials: 'include' });
      return (await res.json()).data || [];
    },
    refetchInterval: 15000
  });

  const criticalBeds = beds.filter((b: any) => b.publicStatus === 'Full' || b.publicStatus === 'Critical');
  const criticalBlood = blood.filter((b: any) => b.units < 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Siren size={28} color="#DC2626" /> Emergency & Surge Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Real-time critical resource status and emergency surge control.</p>
        </div>
        <button
          onClick={() => setSurgeModeActive(!surgeModeActive)}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
            background: surgeModeActive ? '#DC2626' : '#166534', color: 'white',
            boxShadow: surgeModeActive ? '0 0 20px rgba(220,38,38,0.4)' : 'none',
            transition: 'all 0.3s',
            animation: surgeModeActive ? 'pulse 1.5s infinite' : 'none'
          }}
        >
          {surgeModeActive ? '🔴 SURGE MODE ACTIVE — Click to Deactivate' : '⚡ Activate Surge Mode'}
        </button>
      </div>

      {surgeModeActive && (
        <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: '#991B1B', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={24} /> SURGE MODE ACTIVATED
          </div>
          <p style={{ margin: 0, color: '#7F1D1D' }}>
            All clinical staff have been notified. OPD queues are in emergency mode. Resource requests have been escalated to the District Office. 
            Bed availability is being updated in real-time.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Bed size={20} color="#DC2626" /> Critical Ward Status
          </h2>
          {criticalBeds.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>All wards have acceptable capacity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {criticalBeds.map((bed: any) => (
                <div key={bed._id} style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#991B1B' }}>{bed.wardType}</div>
                    <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '1.25rem' }}>{bed.available}/{bed.total}</div>
                  </div>
                  <div style={{ height: '6px', background: '#FECACA', borderRadius: '999px', marginTop: '0.5rem' }}>
                    <div style={{ height: '100%', width: `${(bed.occupied / bed.total) * 100}%`, background: '#DC2626', borderRadius: '999px' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.25rem' }}>{bed.publicStatus} — {Math.round((bed.occupied / bed.total) * 100)}% occupancy</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Droplets size={20} color="#DC2626" /> Critical Blood Stock
          </h2>
          {criticalBlood.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>All blood groups have adequate stock.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {criticalBlood.map((b: any) => (
                <div key={b._id} style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '1.25rem' }}>{b.bloodGroup}</div>
                  <div style={{ fontWeight: 800, color: '#DC2626' }}>{b.units} units</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <Pill size={20} color="#DC2626" /> All Bed Wards Snapshot
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {beds.map((bed: any) => {
            const pct = Math.round((bed.occupied / bed.total) * 100);
            const color = pct >= 100 ? '#DC2626' : pct >= 90 ? '#D97706' : '#16A34A';
            return (
              <div key={bed._id} style={{ background: 'var(--bg-soft)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{bed.wardType}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{bed.occupied} / {bed.total} occupied</div>
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '999px' }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: '999px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color, fontWeight: 600, marginTop: '0.25rem' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
