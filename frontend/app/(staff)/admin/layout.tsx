'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Activity, Calendar, Users, Briefcase, 
  Clock, Bed, Pill, FlaskConical, Stethoscope, 
  AlertTriangle, FileText, BarChart2, Shield,
  Droplets, Wrench, ArrowRightLeft, Siren, LogOut
} from 'lucide-react';

const MENU_ITEMS = [
  { section: 'Overview', items: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Monitor', href: '/admin/live', icon: Activity },
  ]},
  { section: 'Clinical', items: [
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'OPD & Queues', href: '/admin/queues', icon: Users },
    { name: 'Clinics', href: '/admin/clinics', icon: Stethoscope },
    { name: 'Doctors', href: '/admin/doctors', icon: Users },
    { name: 'Ward Admissions', href: '/admin/wards', icon: Bed },
  ]},
  { section: 'Staff', items: [
    { name: 'Departments', href: '/admin/departments', icon: Briefcase },
    { name: 'Staff', href: '/admin/staff', icon: Users },
    { name: 'Attendance', href: '/admin/attendance', icon: Clock },
  ]},
  { section: 'Inventory', items: [
    { name: 'Beds', href: '/admin/beds', icon: Bed },
    { name: 'Blood Bank', href: '/admin/blood', icon: Droplets },
    { name: 'Pharmacy', href: '/admin/pharmacy', icon: Pill },
    { name: 'Dispensary', href: '/admin/dispensary', icon: LogOut },
    { name: 'Equipment', href: '/admin/equipment', icon: Wrench },
  ]},
  { section: 'Diagnostics', items: [
    { name: 'Laboratory', href: '/admin/lab', icon: FlaskConical },
    { name: 'Radiology', href: '/admin/radiology', icon: Activity },
  ]},
  { section: 'Operations', items: [
    { name: 'Referrals', href: '/admin/referrals', icon: ArrowRightLeft },
    { name: 'Emergency', href: '/admin/emergency', icon: Siren },
    { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
    { name: 'Audit Log', href: '/admin/audit', icon: Shield },
    { name: 'Reports', href: '/admin/reports', icon: BarChart2 },
    { name: 'Data Quality', href: '/admin/data-quality', icon: FileText },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '1rem 0', overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {MENU_ITEMS.map((group) => (
            <div key={group.section}>
              <div style={{ padding: '0.75rem 1.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.6 }}>
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1.5rem',
                      color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--teal-light)' : 'transparent',
                      borderRight: isActive ? '3px solid var(--teal)' : '3px solid transparent',
                      fontWeight: isActive ? 600 : 500,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      fontSize: '0.9rem'
                    }}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
