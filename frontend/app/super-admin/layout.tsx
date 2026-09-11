'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity, Bell, Building2, Database, FileClock, Gauge, KeyRound,
  LayoutDashboard, LogOut, Settings, ShieldCheck, Users, Workflow,
} from 'lucide-react';

const sections = [
  { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'System health', href: '/super-admin/system-health', icon: Activity },
  { label: 'Users', href: '/super-admin/users', icon: Users },
  { label: 'Roles', href: '/super-admin/roles', icon: KeyRound },
  { label: 'Permissions', href: '/super-admin/permissions', icon: ShieldCheck },
  { label: 'Institutions', href: '/super-admin/institutions', icon: Building2 },
  { label: 'Integrations', href: '/super-admin/integrations', icon: Workflow },
  { label: 'Security', href: '/super-admin/security', icon: ShieldCheck },
  { label: 'Sessions', href: '/super-admin/sessions', icon: Gauge },
  { label: 'Audit', href: '/super-admin/audit', icon: FileClock },
  { label: 'Jobs', href: '/super-admin/jobs', icon: Database },
  { label: 'Data imports', href: '/super-admin/data-imports', icon: Database },
  { label: 'Notifications', href: '/super-admin/notifications', icon: Bell },
  { label: 'Settings', href: '/super-admin/settings', icon: Settings },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${api}/api/v1/auth/me`, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error('Authentication required');
        const data = await response.json();
        if (data.user?.role !== 'SUPER_ADMIN') throw new Error('Super administrator access required');
        setReady(true);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const logout = async () => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    await fetch(`${api}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
    router.replace('/login');
  };

  if (!ready) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>Checking privileged access...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <aside style={{ width: 256, flexShrink: 0, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '1.25rem 0' }}>
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--teal)', fontWeight: 800, fontSize: '1.1rem' }}>LankaCare</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '.75rem', marginTop: '.2rem' }}>Platform administration</div>
        </div>
        <nav aria-label="Super administrator navigation" style={{ paddingTop: '.75rem' }}>
          {sections.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.58rem 1.25rem',
              color: active ? 'var(--teal)' : 'var(--text-secondary)', background: active ? 'var(--teal-light)' : 'transparent',
              textDecoration: 'none', fontWeight: active ? 700 : 500, fontSize: '.86rem',
            }}><Icon size={16} />{label}</Link>;
          })}
        </nav>
        <button onClick={logout} style={{ margin: '1rem 1.25rem 0', display: 'flex', alignItems: 'center', gap: '.5rem', background: 'transparent', border: 0, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <main style={{ flex: 1, padding: '2rem', minWidth: 0 }}>{children}</main>
    </div>
  );
}
