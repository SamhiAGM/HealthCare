'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Clock, HeartPulse, FileText,
  Settings, LogOut, Menu, X, User
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/citizen/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/citizen/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
  { href: '/citizen/queue', label: 'Live Queue', icon: <Clock size={20} /> },
  { href: '/citizen/health-wallet', label: 'Health Wallet', icon: <HeartPulse size={20} /> },
  { href: '/citizen/prescriptions', label: 'Prescriptions', icon: <FileText size={20} /> },
  { href: '/citizen/settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function CitizenDashboardLayout({ children }: DashboardLayoutProps) {
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
      // Force logout on client side even if server fails
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
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 260,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none',
        }}
        className="dashboard-sidebar"
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size="sm" />
          <button className="mobile-only" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
                  background: isActive ? 'var(--teal-soft)' : 'transparent',
                  color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                }}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem',
              background: 'transparent', border: 'none', color: '#DC2626', fontWeight: 500,
              cursor: 'pointer', textAlign: 'left', borderRadius: 10,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#FEF2F2')}
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
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, display: 'none' }} className="desktop-only">
              Citizen Portal
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle compact />
            <Link href="/citizen/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                <User size={18} />
              </div>
            </Link>
          </div>
        </header>
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .dashboard-sidebar { transform: translateX(0) !important; }
          .dashboard-main { margin-left: 260px; }
          .mobile-only { display: none !important; }
          .desktop-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}
