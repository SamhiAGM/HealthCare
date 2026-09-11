'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API}/api/v1/auth/me`, { credentials: 'include' });
        
        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const data = await res.json();
        const role = data.user?.role;

        // Route guarding logic
        if (pathname.startsWith('/doctor') && role !== 'DOCTOR') {
          router.replace('/citizen/dashboard');
          return;
        }

        if (pathname.startsWith('/reception') && role !== 'RECEPTION_STAFF') {
          router.replace('/citizen/dashboard');
          return;
        }

        if (pathname.startsWith('/pharmacy') && role !== 'PHARMACIST') {
          router.replace('/citizen/dashboard');
          return;
        }

        if (pathname.startsWith('/ministry') && role !== 'MINISTRY_ADMIN' && role !== 'SUPER_ADMIN') {
          router.replace('/citizen/dashboard');
          return;
        }

        if (pathname.startsWith('/lab') && role !== 'LAB_STAFF') {
          router.replace('/citizen/dashboard');
          return;
        }

        if (pathname.startsWith('/admin') && role !== 'HOSPITAL_ADMIN') {
          router.replace('/citizen/dashboard');
          return;
        }

        if (pathname.startsWith('/super-admin') && role !== 'SUPER_ADMIN') {
          router.replace('/citizen/dashboard');
          return;
        }

        // Add more role guards here as needed

        setAuthorized(true);
      } catch (error) {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 size={40} className="spin" color="var(--teal)" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--teal)' }}>LankaCare Staff</div>
        <button 
          onClick={handleLogout}
          style={{ padding: '0.5rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          Logout
        </button>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
