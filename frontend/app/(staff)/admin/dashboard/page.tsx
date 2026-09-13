'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Bed, Droplets, Pill, Users, FlaskConical, ArrowRightLeft, Clock } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, sub, icon: Icon, color, href }: any) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
            {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{sub}</div>}
          </div>
          <div style={{ background: `${color}20`, padding: '0.75rem', borderRadius: '10px' }}>
            <Icon size={22} color={color} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data: beds = [] } = useQuery({ queryKey: ['dash-beds'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/beds`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });
  const { data: blood = [] } = useQuery({ queryKey: ['dash-blood'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/blood`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });
  const { data: medicines = [] } = useQuery({ queryKey: ['dash-medicines'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/medicines`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });
  const { data: queues = [] } = useQuery({ queryKey: ['dash-queues'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/queues`, { credentials: 'include' })).json()).data || [], refetchInterval: 5000 });
  const { data: admissions = [] } = useQuery({ queryKey: ['dash-admissions'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/admissions?status=Admitted`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });
  const { data: lab = [] } = useQuery({ queryKey: ['dash-lab'], queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/lab?status=Pending`, { credentials: 'include' })).json()).data || [], refetchInterval: 30000 });

  const totalBeds = beds.reduce((s: number, b: any) => s + b.total, 0);
  const occupiedBeds = beds.reduce((s: number, b: any) => s + b.occupied, 0);
  const criticalBeds = beds.filter((b: any) => ['Full', 'Critical'].includes(b.publicStatus));
  const criticalBlood = blood.filter((b: any) => b.units < 10);
  const outOfStockMeds = medicines.filter((m: any) => m.availability === 'out-of-stock');
  const activeQueue = queues.filter((q: any) => ['Waiting', 'Approaching', 'Called', 'In-Consultation'].includes(q.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Hospital Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', background: '#DCFCE7', padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.875rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', animation: 'pulse 2s infinite' }} />
          Live
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard title="Currently Admitted" value={admissions.length} sub={`${totalBeds - occupiedBeds} beds available`} icon={Bed} color="#1D4ED8" href="/admin/wards" />
        <StatCard title="OPD Queue" value={activeQueue} sub="Patients being served" icon={Users} color="#0D9488" href="/admin/queues" />
        <StatCard title="Lab Tests Pending" value={lab.length} sub="Awaiting results" icon={FlaskConical} color="#9333EA" href="/admin/lab" />
        <StatCard title="Blood Types Critical" value={criticalBlood.length} sub="Units < 10" icon={Droplets} color="#DC2626" href="/admin/blood" />
        <StatCard title="Medicines Out of Stock" value={outOfStockMeds.length} sub={`${medicines.length} total tracked`} icon={Pill} color="#D97706" href="/admin/pharmacy" />
        <StatCard title="Wards at Capacity" value={criticalBeds.length} sub={`of ${beds.length} total wards`} icon={Activity} color="#DC2626" href="/admin/emergency" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bed size={18} color="var(--teal)" />Ward Occupancy</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {beds.length === 0 ? <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No wards configured</div> : beds.map((bed: any) => {
              const pct = Math.min(Math.round((bed.occupied / bed.total) * 100), 100);
              const color = pct >= 100 ? '#DC2626' : pct >= 90 ? '#D97706' : '#16A34A';
              return (
                <div key={bed._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{bed.wardType}</span>
                    <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{bed.occupied}/{bed.total}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border)', borderRadius: '999px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} color="var(--teal)" />Live OPD Queue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {queues.length === 0 ? <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No active queue</div>
              : queues.slice(0, 10).map((q: any) => (
                <div key={q._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-soft)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '1.1rem', minWidth: '50px' }}>{q.tokenNumber}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, paddingLeft: '0.5rem' }}>{q.citizenId?.name || 'Walk-in'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: q.status === 'In-Consultation' ? '#DCFCE7' : q.status === 'Called' ? '#FFEDD5' : '#F3F4F6', color: q.status === 'In-Consultation' ? '#166534' : q.status === 'Called' ? '#9A3412' : '#4B5563' }}>{q.status}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
        {blood.map((b: any) => {
          const level = b.units < 5 ? 'Critical' : b.units < 10 ? 'Low' : 'OK';
          const color = b.units < 5 ? '#DC2626' : b.units < 10 ? '#D97706' : '#16A34A';
          return (
            <div key={b._id} style={{ background: 'var(--bg-card)', borderRadius: '10px', border: `1px solid ${color}40`, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{b.bloodGroup}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>{b.units} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>units</span></div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color, letterSpacing: '0.05em' }}>{level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
