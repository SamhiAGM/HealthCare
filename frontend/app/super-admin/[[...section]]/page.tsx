'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertTriangle, Building2, CheckCircle2, Lock, Search, Server, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const titles: Record<string, { title: string; description: string }> = {
  dashboard: { title: 'Platform dashboard', description: 'Operational overview for the LankaCare platform.' },
  'system-health': { title: 'System health', description: 'Monitor platform services and operational readiness.' },
  users: { title: 'User management', description: 'Manage privileged accounts without exposing clinical records.' },
  roles: { title: 'Roles', description: 'Review the role catalogue and its governance scope.' },
  permissions: { title: 'Permissions', description: 'Permission governance is separated from clinical access.' },
  institutions: { title: 'Institutions', description: 'Review hospital onboarding and verification state.' },
  integrations: { title: 'Integrations', description: 'Integration configuration and service connectivity.' },
  security: { title: 'Security', description: 'Review recent failed actions and platform security posture.' },
  sessions: { title: 'Sessions', description: 'Session monitoring is available to privileged administrators.' },
  audit: { title: 'Audit', description: 'Immutable operational activity trail.' },
  jobs: { title: 'Background jobs', description: 'Track imports, notifications, and scheduled work.' },
  'data-imports': { title: 'Data imports', description: 'Monitor verified source imports and their outcomes.' },
  notifications: { title: 'Notifications', description: 'Review platform notification delivery.' },
  settings: { title: 'Platform settings', description: 'Review safe defaults and retention controls.' },
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getData(section: string) {
  const endpoint = section === 'dashboard' ? 'stats' : section;
  const response = await fetch(`${apiBase}/api/v1/super-admin/${endpoint}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to load administrator data');
  return response.json();
}

export default function SuperAdminPage() {
  const params = useParams<{ section?: string[] }>();
  const section = params.section?.[0] || 'dashboard';
  const meta = titles[section] || titles.dashboard;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const isUsers = section === 'users';
  const query = useQuery({ queryKey: ['super-admin', section], queryFn: () => getData(section), retry: 1 });
  const users = query.data?.data || [];
  const filteredUsers = useMemo(() => users.filter((user: any) => JSON.stringify(user).toLowerCase().includes(search.toLowerCase())), [users, search]);
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${apiBase}/api/v1/super-admin/users/${id}/status`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Unable to update account status');
      return response.json();
    },
    onSuccess: () => { toast.success('Account status updated'); queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] }); },
    onError: error => toast.error(error.message),
  });

  return <div style={{ maxWidth: 1440, margin: '0 auto' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.75rem' }}>
      <div><div style={{ color: 'var(--teal)', fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>Super administration</div><h1 style={{ margin: '.35rem 0', fontSize: '1.8rem' }}>{meta.title}</h1><p style={{ margin: 0, color: 'var(--text-secondary)' }}>{meta.description}</p></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .75rem', borderRadius: 999, background: '#DCFCE7', color: '#166534', fontSize: '.8rem', fontWeight: 700 }}><CheckCircle2 size={15} /> Privileged access</div>
    </header>
    {query.isLoading && <div className="lc-card" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading platform data...</div>}
    {query.isError && <div className="lc-card" style={{ padding: '2rem', color: '#991B1B' }}><AlertTriangle size={18} /> Unable to load this resource.</div>}
    {!query.isLoading && !query.isError && section === 'dashboard' && <Dashboard data={query.data?.data} />}
    {!query.isLoading && !query.isError && section === 'system-health' && <ServiceList services={query.data?.data?.services || []} />}
    {!query.isLoading && !query.isError && isUsers && <UserTable users={filteredUsers} search={search} setSearch={setSearch} updateStatus={(id, status) => statusMutation.mutate({ id, status })} />}
    {!query.isLoading && !query.isError && !['dashboard', 'system-health', 'users'].includes(section) && <ResourceTable section={section} data={query.data?.data || []} />}
  </div>;
}

function Dashboard({ data }: { data?: any }) {
  const cards = [
    ['Users', data?.users ?? 0, Users, '/super-admin/users'],
    ['Active users', data?.activeUsers ?? 0, Activity, '/super-admin/users'],
    ['Institutions', data?.hospitals ?? 0, Building2, '/super-admin/institutions'],
    ['Pending verification', data?.pendingHospitals ?? 0, AlertTriangle, '/super-admin/institutions'],
    ['Security alerts (24h)', data?.securityAlerts ?? 0, Lock, '/super-admin/security'],
    ['Failed jobs', data?.failedJobs ?? 0, Server, '/super-admin/jobs'],
  ];
  return <><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem' }}>{cards.map(([label, value, Icon, href]) => <Link href={href as string} key={label as string} className="lc-card" style={{ padding: '1.2rem', textDecoration: 'none' }}><Icon size={20} color="var(--teal)" /><div style={{ color: 'var(--text-secondary)', fontSize: '.8rem', marginTop: '.7rem' }}>{label}</div><div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value as number}</div></Link>)}</div><div className="lc-card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}><h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Platform services</h2><ServiceList services={data?.services || []} /></div></>;
}

function ServiceList({ services }: { services: any[] }) {
  return <div style={{ display: 'grid', gap: '.65rem' }}>{services.map(service => <div key={service.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '.75rem', background: 'var(--bg-soft)', borderRadius: 8 }}><span>{service.name}</span><span style={{ color: '#166534', fontWeight: 700, fontSize: '.85rem' }}>{service.status}</span></div>)}</div>;
}

function UserTable({ users, search, setSearch, updateStatus }: { users: any[]; search: string; setSearch: (value: string) => void; updateStatus: (id: string, status: string) => void }) {
  return <div className="lc-card" style={{ overflow: 'hidden' }}><div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.75rem' }}><Search size={17} color="var(--text-secondary)" /><input className="lc-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search email, staff ID, or role" /></div><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{['Account', 'Role', 'Status', 'Last sign-in', 'Actions'].map(label => <th key={label} style={{ padding: '.8rem 1rem', color: 'var(--text-secondary)', fontSize: '.8rem' }}>{label}</th>)}</tr></thead><tbody>{users.map(user => <tr key={user._id} style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: '1rem' }}>{user.email || user.mobile || user.staffId || user._id}</td><td style={{ padding: '1rem' }}>{user.role}</td><td style={{ padding: '1rem' }}>{user.status}</td><td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td><td style={{ padding: '1rem' }}><select aria-label={`Update status for ${user.email || user._id}`} value={user.status} onChange={event => updateStatus(user._id, event.target.value)} className="lc-input" style={{ minWidth: 130 }}><option>Active</option><option>Locked</option><option>Suspended</option></select></td></tr>)}</tbody></table>{users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No accounts found.</div>}</div></div>;
}

function ResourceTable({ section, data }: { section: string; data: any[] }) {
  const rows = (Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : [])).slice(0, 100);
  const columns = rows.length ? Object.keys(rows[0]).filter(key => !['_id', '__v', 'details'].includes(key)).slice(0, 6) : [];
  return <div className="lc-card" style={{ overflow: 'auto' }}>{rows.length ? <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{columns.map(column => <th key={column} style={{ padding: '.8rem 1rem', color: 'var(--text-secondary)', fontSize: '.8rem' }}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row._id || index} style={{ borderTop: '1px solid var(--border)' }}>{columns.map(column => <td key={column} style={{ padding: '1rem', fontSize: '.88rem' }}>{typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column] ?? '-')}</td>)}</tr>)}</tbody></table> : <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No {section.replace('-', ' ')} records found.</div>}</div>;
}
