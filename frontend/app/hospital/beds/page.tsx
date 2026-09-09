'use client';

import { BedDouble, Users, Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/Button';

export default function HospitalBedsPage() {
  const wards = [
    { id: '1', name: 'General Medical Ward (Male)', type: 'General', total: 60, occupied: 58, status: 'Critical' },
    { id: '2', name: 'General Medical Ward (Female)', type: 'General', total: 60, occupied: 52, status: 'Normal' },
    { id: '3', name: 'Surgical ICU', type: 'ICU', total: 12, occupied: 12, status: 'Full' },
    { id: '4', name: 'Pediatric Ward', type: 'Pediatric', total: 40, occupied: 28, status: 'Normal' },
    { id: '5', name: 'Maternity Ward', type: 'Maternity', total: 50, occupied: 45, status: 'High' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BedDouble size={24} color="var(--teal)" /> Bed Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track hospital bed occupancy across all wards and units.</p>
        </div>
        <Button variant="primary" onClick={() => alert("Add Ward dialog will appear here.")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Ward
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {wards.map(w => {
          const occupancyRate = (w.occupied / w.total) * 100;
          let color = '#16A34A';
          if (occupancyRate >= 100) color = '#DC2626';
          else if (occupancyRate >= 85) color = '#D97706';

          return (
            <div key={w.id} className="lc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{w.name}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{w.type}</div>
                </div>
                <button onClick={() => alert(`Edit details for ${w.name}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Users size={16} /> Occupancy
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color }}>
                  {w.occupied} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {w.total}</span>
                </div>
              </div>

              <div style={{ height: 6, background: 'var(--bg-soft)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: color, width: `${Math.min(occupancyRate, 100)}%` }} />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => alert(`Patient admitted to ${w.name}`)} style={{ flex: 1 }}>Admit (+1)</Button>
                <Button variant="outline" size="sm" onClick={() => alert(`Patient discharged from ${w.name}`)} style={{ flex: 1 }}>Discharge (-1)</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
