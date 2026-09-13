'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

function QualityCheck({ label, pass, message }: { label: string, pass: boolean | null, message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: pass === null ? 'var(--bg-soft)' : pass ? '#F0FDF4' : '#FEF2F2' }}>
      <div style={{ marginTop: '2px' }}>
        {pass === null ? <AlertTriangle size={20} color="#D97706" /> : pass ? <CheckCircle size={20} color="#16A34A" /> : <XCircle size={20} color="#DC2626" />}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{message}</div>
      </div>
    </div>
  );
}

export default function DataQualityPage() {
  const { data: beds = [], isLoading: bedsLoading } = useQuery({ queryKey: ['dq-beds'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/beds`, { credentials: 'include' })).json()).data || [] });
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({ queryKey: ['dq-doctors'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/doctors`, { credentials: 'include' })).json()).data || [] });
  const { data: medicines = [], isLoading: medsLoading } = useQuery({ queryKey: ['dq-medicines'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/medicines`, { credentials: 'include' })).json()).data || [] });
  const { data: blood = [], isLoading: bloodLoading } = useQuery({ queryKey: ['dq-blood'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/blood`, { credentials: 'include' })).json()).data || [] });

  const isLoading = bedsLoading || doctorsLoading || medsLoading || bloodLoading;

  const checks = [
    { label: 'Bed Inventory Configured', pass: beds.length > 0, message: beds.length > 0 ? `${beds.length} ward types registered.` : 'No bed inventory found. Add at least one ward type.' },
    { label: 'Doctors on Record', pass: doctors.length > 0, message: doctors.length > 0 ? `${doctors.length} doctors registered.` : 'No doctors found. Register clinical staff.' },
    { label: 'Medicine Inventory Present', pass: medicines.length > 0, message: medicines.length > 0 ? `${medicines.length} medicines tracked.` : 'No medicines recorded in inventory.' },
    { label: 'Blood Bank Configured', pass: blood.length > 0, message: blood.length > 0 ? `${blood.length} blood types tracked.` : 'Blood bank inventory is empty.' },
    { label: 'No Out-of-Stock Medicines', pass: medicines.filter((m: any) => m.availability === 'out-of-stock').length === 0, message: medicines.filter((m: any) => m.availability === 'out-of-stock').length === 0 ? 'All tracked medicines are in stock.' : `${medicines.filter((m: any) => m.availability === 'out-of-stock').length} medicine(s) are out of stock.` },
    { label: 'No Critical Blood Shortage', pass: blood.filter((b: any) => b.units < 5).length === 0, message: blood.filter((b: any) => b.units < 5).length === 0 ? 'All blood types have adequate stock.' : `${blood.filter((b: any) => b.units < 5).length} blood type(s) have critically low stock (< 5 units).` },
    { label: 'No Full Wards', pass: beds.filter((b: any) => b.publicStatus === 'Full').length === 0, message: beds.filter((b: any) => b.publicStatus === 'Full').length === 0 ? 'No wards are at full capacity.' : `${beds.filter((b: any) => b.publicStatus === 'Full').length} ward(s) are at 100% capacity.` },
    { label: 'Expiring Medicines Check', pass: medicines.filter((m: any) => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000)).length === 0, message: medicines.filter((m: any) => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000)).length === 0 ? 'No medicines expiring within 30 days.' : `${medicines.filter((m: any) => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000)).length} medicine(s) expiring soon.` },
  ];

  const passing = checks.filter(c => c.pass).length;
  const score = Math.round((passing / checks.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={28} color="var(--teal)" /> Data Quality Check
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Automated health checks to ensure hospital data completeness and accuracy.</p>
      </div>

      {!isLoading && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(${score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626'} ${score * 3.6}deg, var(--border) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626' }}>{score}%</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {score >= 80 ? 'Good Health' : score >= 60 ? 'Needs Attention' : 'Critical Issues'}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{passing} of {checks.length} checks passed</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Running checks...</div>
        ) : (
          checks.map((check, i) => <QualityCheck key={i} {...check} />)
        )}
      </div>
    </div>
  );
}
