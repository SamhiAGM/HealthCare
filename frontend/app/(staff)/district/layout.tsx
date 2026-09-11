'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, AlertTriangle, Building2, BarChart2, ArrowRightLeft, FileText } from 'lucide-react';

const MENU_ITEMS = [
  { section: 'Overview', items: [
    { name: 'Dashboard', href: '/district/dashboard', icon: LayoutDashboard },
    { name: 'Live Monitor', href: '/district/live', icon: Activity },
  ]},
  { section: 'Management', items: [
    { name: 'Hospitals', href: '/district/hospitals', icon: Building2 },
    { name: 'Alerts', href: '/district/alerts', icon: AlertTriangle },
    { name: 'Resource Requests', href: '/district/resource-requests', icon: ArrowRightLeft },
  ]},
  { section: 'Analytics', items: [
    { name: 'Reports', href: '/district/reports', icon: BarChart2 },
    { name: 'Data Quality', href: '/district/data-quality', icon: FileText },
  ]},
];

export default function DistrictLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <aside style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '1rem 0', overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.5rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)' }}>District Admin</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MENU_ITEMS.map((group) => (
            <div key={group.section}>
              <div style={{ padding: '0.75rem 1.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.6 }}>{group.section}</div>
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.name} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1.5rem', color: isActive ? 'var(--teal)' : 'var(--text-secondary)', background: isActive ? 'var(--teal-light)' : 'transparent', borderRight: isActive ? '3px solid var(--teal)' : '3px solid transparent', fontWeight: isActive ? 600 : 500, textDecoration: 'none', transition: 'all 0.2s', fontSize: '0.9rem' }}>
                    <item.icon size={16} /><span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
