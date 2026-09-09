'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Clock, Pill, BedDouble, Droplets,
  Users, Settings, LogOut, Menu, X, ShieldAlert
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/hospital/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/hospital/clinics', label: 'Clinics Management', icon: <Building2 size={20} /> },
  { href: '/hospital/queue', label: 'Queue Operations', icon: <Clock size={20} /> },
  { href: '/hospital/medicines', label: 'Pharmacy Inventory', icon: <Pill size={20} /> },
  { href: '/hospital/beds', label: 'Bed Management', icon: <BedDouble size={20} /> },
  { href: '/hospital/blood', label: 'Blood Bank', icon: <Droplets size={20} /> },
  { href: '/hospital/staff', label: 'Staff Directory', icon: <Users size={20} /> },
];

export default function HospitalAdminLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-soft)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, width: 280,
          background: 'linear-gradient(180deg, #111827 0%, #1F2937 100%)', // Dark theme for staff
          color: '#E5E7EB',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex', flexDirection: 'column',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        }}
        className="dashboard-sidebar"
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Logo size="sm" isDark />
          <button className="mobile-only" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Hospital Scope</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            National Hospital of Sri Lanka
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  borderRadius: 10, textDecoration: 'none',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? 'white' : '#9CA3AF',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem',
              background: 'transparent', border: 'none', color: '#FCA5A5', fontWeight: 500,
              cursor: 'pointer', textAlign: 'left', borderRadius: 10, transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }} className="dashboard-main">
        <header
          style={{
            background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
            padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-only" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}>
              <Menu size={24} />
            </button>
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', padding: '0.375rem 0.75rem', borderRadius: 999, color: '#DC2626', fontSize: '0.75rem', fontWeight: 700 }}>
              <ShieldAlert size={14} /> HOSPITAL ADMIN MODE
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle compact />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ textAlign: 'right', display: 'none' }} className="desktop-only">
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin User</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Admin</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111827', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                A
              </div>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .dashboard-sidebar { transform: translateX(0) !important; }
          .dashboard-main { margin-left: 280px; }
          .mobile-only { display: none !important; }
          .desktop-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}
