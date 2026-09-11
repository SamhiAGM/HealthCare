'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LayoutDashboard, Calendar, Users, Activity, FileText, Settings, Stethoscope, BedDouble, PlusSquare, TestTube2, Building2, Pill } from 'lucide-react';
import RolePortalLayout, { NavItem } from '@/components/RolePortalLayout';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
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
        setUserRole(role);
        setUserName(data.user?.firstName ? `${data.user.firstName} ${data.user.lastName}` : data.user?.email || 'User');

        // Route guarding logic
        if (pathname.startsWith('/doctor') && role !== 'DOCTOR') return router.replace('/citizen/dashboard');
        if (pathname.startsWith('/reception') && role !== 'RECEPTION_STAFF') return router.replace('/citizen/dashboard');
        if (pathname.startsWith('/pharmacy') && role !== 'PHARMACIST') return router.replace('/citizen/dashboard');
        if (pathname.startsWith('/ministry') && role !== 'MINISTRY_ADMIN' && role !== 'SUPER_ADMIN') return router.replace('/citizen/dashboard');
        if (pathname.startsWith('/lab') && role !== 'LAB_STAFF') return router.replace('/citizen/dashboard');
        if (pathname.startsWith('/admin') && role !== 'HOSPITAL_ADMIN') return router.replace('/citizen/dashboard');
        if (pathname.startsWith('/super-admin') && role !== 'SUPER_ADMIN') return router.replace('/citizen/dashboard');

        setAuthorized(true);
      } catch (error) {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="flex h-screen justify-center items-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  // Define sidebars based on role
  let navItems: NavItem[] = [];
  let roleTitle = 'Staff Portal';

  switch(userRole) {
    case 'DOCTOR':
      roleTitle = 'Clinical Workspace';
      navItems = [
        { title: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
        { title: 'Appointments', href: '/doctor/appointments', icon: Calendar },
        { title: 'Live Queue', href: '/doctor/queue', icon: Users, badge: 3 },
        { title: 'Consultations', href: '/doctor/consultations', icon: Stethoscope },
        { title: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
        { title: 'Lab Orders', href: '/doctor/lab-orders', icon: TestTube2 },
      ];
      break;
    case 'HOSPITAL_ADMIN':
      roleTitle = 'Hospital Operations';
      navItems = [
        { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Live Operations', href: '/admin/live', icon: Activity },
        { title: 'Patients', href: '/admin/patients', icon: Users },
        { title: 'Staff & Attendance', href: '/admin/staff', icon: Users },
        { title: 'Wards & Beds', href: '/admin/wards', icon: BedDouble },
        { title: 'Settings', href: '/admin/settings', icon: Settings },
      ];
      break;
    case 'MINISTRY_ADMIN':
      roleTitle = 'National Command Center';
      navItems = [
        { title: 'National Overview', href: '/ministry/dashboard', icon: LayoutDashboard },
        { title: 'Live Command Center', href: '/ministry/live', icon: Activity },
        { title: 'Hospitals', href: '/ministry/hospitals', icon: Building2 },
        { title: 'Analytics', href: '/ministry/analytics', icon: FileText },
      ];
      break;
    default:
      navItems = [
        { title: 'Dashboard', href: `/${userRole.toLowerCase()}/dashboard`, icon: LayoutDashboard },
      ];
  }

  return (
    <RolePortalLayout 
      navItems={navItems}
      roleTitle={roleTitle}
      userName={userName}
    >
      {children}
    </RolePortalLayout>
  );
}
