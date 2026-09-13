'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Droplets, Bed, Pill, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const { data: beds = [] } = useQuery({ queryKey: ['alerts-beds'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/beds`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });
  const { data: blood = [] } = useQuery({ queryKey: ['alerts-blood'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/blood`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });
  const { data: medicines = [] } = useQuery({ queryKey: ['alerts-medicines'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/medicines`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });

  const alerts = [
    ...beds.filter((b: any) => ['Full', 'Critical'].includes(b.publicStatus)).map((b: any) => ({
      type: 'Beds', severity: b.publicStatus === 'Full' ? 'critical' : 'high',
      title: `${b.wardType} Ward at Capacity`,
      detail: `${b.occupied}/${b.total} beds occupied (${b.publicStatus})`,
      icon: Bed, color: b.publicStatus === 'Full' ? '#DC2626' : '#D97706'
    })),
    ...blood.filter((b: any) => b.units < 10).map((b: any) => ({
      type: 'Blood', severity: b.units < 5 ? 'critical' : 'high',
      title: `${b.bloodGroup} Blood Stock Low`,
      detail: `Only ${b.units} units remaining`,
      icon: Droplets, color: b.units < 5 ? '#DC2626' : '#D97706'
    })),
    ...medicines.filter((m: any) => m.availability === 'out-of-stock').map((m: any) => ({
      type: 'Pharmacy', severity: 'critical',
      title: `${m.medicineName} Out of Stock`,
      detail: `Medicine is completely out of stock`,
      icon: Pill, color: '#DC2626'
    })),
    ...medicines.filter((m: any) => m.availability === 'low-stock').map((m: any) => ({
      type: 'Pharmacy', severity: 'medium',
      title: `${m.medicineName} Low Stock`,
      detail: `${m.stockLevel} units remaining — reorder soon`,
      icon: Pill, color: '#D97706'
    })),
    ...medicines.filter((m: any) => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000) && new Date(m.expiryDate) > new Date()).map((m: any) => ({
      type: 'Pharmacy', severity: 'medium',
      title: `${m.medicineName} Expiring Soon`,
      detail: `Expires on ${new Date(m.expiryDate).toLocaleDateString()}`,
      icon: Pill, color: '#D97706'
    })),
  ].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return (order[a.severity as keyof typeof order] || 3) - (order[b.severity as keyof typeof order] || 3);
  });

  const severityLabel: any = {
    critical: { bg: '#FEE2E2', color: '#991B1B', text: 'CRITICAL' },
    high: { bg: '#FFEDD5', color: '#9A3412', text: 'HIGH' },
    medium: { bg: '#FEF08A', color: '#854D0E', text: 'MEDIUM' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={28} color="#DC2626" /> Active Alerts
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Real-time alerts generated from hospital resource and clinical data. Auto-refreshes every 30s.</p>
      </div>

      {alerts.length === 0 ? (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="#16A34A" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>All Clear</div>
          <div style={{ color: '#15803D', marginTop: '0.5rem' }}>No critical alerts at this time.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((alert, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: '10px', border: `1px solid ${alert.color}40`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: `${alert.color}20`, padding: '0.75rem', borderRadius: '8px', flexShrink: 0 }}>
                <alert.icon size={20} color={alert.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{alert.detail}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                <span style={{ background: severityLabel[alert.severity]?.bg, color: severityLabel[alert.severity]?.color, padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em' }}>{severityLabel[alert.severity]?.text}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
