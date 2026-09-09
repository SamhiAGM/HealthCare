'use client';

import { Droplets, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/Button';
import { BloodStatusBadge } from '@/components/Badges';

export default function HospitalBloodBankPage() {
  const bloodGroups = [
    { group: 'A+', units: 45, status: 'adequate', lastUpdated: '1 hour ago' },
    { group: 'A-', units: 12, status: 'low', lastUpdated: '2 hours ago' },
    { group: 'B+', units: 58, status: 'adequate', lastUpdated: '1 hour ago' },
    { group: 'B-', units: 8, status: 'critical', lastUpdated: '30 mins ago' },
    { group: 'O+', units: 34, status: 'moderate', lastUpdated: '1 hour ago' },
    { group: 'O-', units: 2, status: 'critical', lastUpdated: '10 mins ago' },
    { group: 'AB+', units: 22, status: 'moderate', lastUpdated: '4 hours ago' },
    { group: 'AB-', units: 5, status: 'critical', lastUpdated: '1 hour ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplets size={24} color="#DC2626" /> Blood Bank Inventory
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage hospital blood reserves and trigger donor alerts.</p>
        </div>
        <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Sync with National DB
        </Button>
      </div>

      {bloodGroups.some(g => g.status === 'critical') && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertCircle size={28} color="#DC2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.25rem' }}>Critical Shortage Alert</h2>
            <p style={{ color: '#B91C1C', fontSize: '0.9375rem', margin: 0 }}>Multiple blood groups are at critical levels (O-, B-, AB-). You can trigger a local donor alert for registered donors in your district.</p>
          </div>
          <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>Trigger Donor SMS Alert</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {bloodGroups.map(bg => (
          <div key={bg.group} className="lc-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: bg.status === 'critical' ? '#FEF2F2' : bg.status === 'low' ? '#FFF7ED' : 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: bg.status === 'critical' ? '#DC2626' : bg.status === 'low' ? '#D97706' : 'var(--text-primary)' }}>{bg.group}</span>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{bg.units}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: 4 }}>units</span>
            </div>
            
            <BloodStatusBadge status={bg.status as any} />
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', marginBottom: '1rem' }}>
              Updated {bg.lastUpdated}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <Button variant="outline" size="sm" style={{ flex: 1, padding: '0.375rem' }}>Update Stock</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
