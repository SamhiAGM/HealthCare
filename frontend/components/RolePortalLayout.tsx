'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, X, Bell, Search, Sun, Moon, LogOut, 
  User, Settings, ChevronRight, Activity 
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface RolePortalLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  roleTitle: string;
  userName: string;
  organization?: string;
}

export default function RolePortalLayout({ 
  children, 
  navItems, 
  roleTitle,
  userName,
  organization = 'LankaCare Operations'
}: RolePortalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  const handleLogout = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      await fetch(`${API}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden`}>
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400 mr-2" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LankaCare</span>
          {isMobile && (
            <button className="ml-auto text-slate-500" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Info Area */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="font-semibold text-sm truncate">{userName}</div>
          <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{roleTitle}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{organization}</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
                <span className="flex-1 truncate">{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium rounded-full ${
                    isActive ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-100' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="flex-shrink-0 flex items-center h-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
          <button 
            className="lg:hidden p-2 -ml-2 mr-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-between items-center">
            
            {/* Breadcrumb / Title Area */}
            <div className="flex items-center text-sm">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{roleTitle}</span>
              <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 capitalize">
                {pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              <div className="hidden sm:block relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 w-48 transition-all"
                />
              </div>

              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
              </button>
              
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium shadow-sm ml-2 cursor-pointer">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
