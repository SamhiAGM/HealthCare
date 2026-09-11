'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp, Users, Bed, FlaskConical, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0D9488', '#1D4ED8', '#9333EA', '#DC2626', '#D97706', '#059669'];

export default function ReportsPage() {
  const { data: beds = [] } = useQuery({ queryKey: ['report-beds'], queryFn: async () => { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/beds`, { credentials: 'include' }); return (await r.json()).data || []; } });
  const { data: blood = [] } = useQuery({ queryKey: ['report-blood'], queryFn: async () => { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/blood`, { credentials: 'include' }); return (await r.json()).data || []; } });
  const { data: medicines = [] } = useQuery({ queryKey: ['report-medicine'], queryFn: async () => { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/medicines`, { credentials: 'include' }); return (await r.json()).data || []; } });
  const { data: admissions = [] } = useQuery({ queryKey: ['report-admissions'], queryFn: async () => { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/admissions`, { credentials: 'include' }); return (await r.json()).data || []; } });

  const bedData = beds.map((b: any) => ({ name: b.wardType, occupied: b.occupied, available: b.available }));
  const bloodData = blood.map((b: any) => ({ name: b.bloodGroup, value: b.units }));
  const availableMeds = medicines.filter((m: any) => m.availability === 'available').length;
  const lowStockMeds = medicines.filter((m: any) => m.availability === 'low-stock').length;
  const outOfStockMeds = medicines.filter((m: any) => m.availability === 'out-of-stock').length;
  const medData = [{ name: 'Available', value: availableMeds }, { name: 'Low Stock', value: lowStockMeds }, { name: 'Out of Stock', value: outOfStockMeds }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart2 size={28} color="var(--teal)" /> Hospital Reports
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Aggregate analytics across all hospital departments and resources.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { label: 'Currently Admitted', value: admissions.filter((a: any) => a.status === 'Admitted').length, icon: Bed, color: 'var(--teal)' },
          { label: 'Total Beds', value: beds.reduce((s: number, b: any) => s + b.total, 0), icon: Bed, color: '#1D4ED8' },
          { label: 'Medicines Tracked', value: medicines.length, icon: FlaskConical, color: '#9333EA' },
          { label: 'Blood Types Stocked', value: blood.length, icon: Users, color: '#DC2626' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{stat.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              </div>
              <stat.icon size={28} color={stat.color} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bed Occupancy by Ward</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="occupied" fill="#DC2626" name="Occupied" radius={[4,4,0,0]} />
              <Bar dataKey="available" fill="#16A34A" name="Available" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Blood Bank Units</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={bloodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {bloodData.map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pharmacy Inventory Status</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={medData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={100} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
            <Bar dataKey="value" fill="var(--teal)" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
