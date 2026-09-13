'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Bed, Droplets, Users, FlaskConical, ArrowRightLeft, Volume2, UserCheck } from 'lucide-react';

export default function LiveMonitorPage() {
  const { data: queues = [] } = useQuery({
    queryKey: ['live-queues'], refetchInterval: 3000,
    queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/queues`, { credentials: 'include' })).json()).data || []
  });
  const { data: beds = [] } = useQuery({
    queryKey: ['live-beds'], refetchInterval: 10000,
    queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/beds`, { credentials: 'include' })).json()).data || []
  });
  const { data: admissions = [] } = useQuery({
    queryKey: ['live-admissions'], refetchInterval: 15000,
    queryFn: async () => (await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')}/api/v1/admissions?status=Admitted`, { credentials: 'include' })).json()).data || []
  });

  const waiting = queues.filter((q: any) => q.status === 'Waiting').length;
  const called = queues.filter((q: any) => q.status === 'Called').length;
  const inConsultation = queues.filter((q: any) => q.status === 'In-Consultation').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={28} color="#DC2626" /> Live Monitor
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Real-time hospital operations. Data refreshes automatically every few seconds.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 700 }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
          LIVE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {[
          { label: 'Waiting', value: waiting, icon: Users, color: '#4B5563', bg: '#F3F4F6' },
          { label: 'Called to Counter', value: called, icon: Volume2, color: '#9A3412', bg: '#FFEDD5' },
          { label: 'In Consultation', value: inConsultation, icon: UserCheck, color: '#166534', bg: '#DCFCE7' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, padding: '1.5rem', borderRadius: '12px', border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <stat.icon size={32} color={stat.color} />
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ color: stat.color, fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>OPD Queue — Live</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '360px', overflowY: 'auto' }}>
            {queues.length === 0 ? <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Queue is empty</div>
              : queues.map((q: any) => (
                <div key={q._id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
                  background: q.status === 'In-Consultation' ? '#F0FDF4' : q.status === 'Called' ? '#FFFBEB' : 'var(--bg-soft)',
                  border: `1px solid ${q.status === 'In-Consultation' ? '#BBF7D0' : q.status === 'Called' ? '#FDE68A' : 'var(--border)'}`,
                  transition: 'background 0.5s'
                }}>
                  <span style={{ fontWeight: 900, color: 'var(--teal)', fontSize: '1.25rem', minWidth: '60px' }}>{q.tokenNumber}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.citizenId?.name || 'Walk-in Patient'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{q.departmentId?.name || 'General'}</div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: q.status === 'In-Consultation' ? '#DCFCE7' : q.status === 'Called' ? '#FEF08A' : '#F3F4F6', color: q.status === 'In-Consultation' ? '#166534' : q.status === 'Called' ? '#854D0E' : '#4B5563' }}>{q.status}</span>
                </div>
              ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', flex: 1 }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bed size={16} />Ward Capacity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {beds.map((bed: any) => {
                const pct = Math.min(Math.round((bed.occupied / bed.total) * 100), 100);
                const color = pct >= 100 ? '#DC2626' : pct >= 90 ? '#D97706' : '#16A34A';
                return (
                  <div key={bed._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bed.wardType}</span>
                      <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Currently Admitted</h2>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#1D4ED8', textAlign: 'center' }}>{admissions.length}</div>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Inpatients</div>
          </div>
        </div>
      </div>
    </div>
  );
}
