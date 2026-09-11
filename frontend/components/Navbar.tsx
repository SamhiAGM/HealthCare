'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Home, Building2, Stethoscope, Pill, Droplets,
  Map, Heart, Info, Phone, LogIn, UserPlus, ChevronDown, Globe
} from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
  children?: NavLink[];
}

const PUBLIC_LINKS: NavLink[] = [
  { href: '/',               label: 'Home',       icon: <Home size={16}/> },
  { href: '/hospitals',      label: 'Hospitals',  icon: <Building2 size={16}/> },
  { href: '/doctors',        label: 'Doctors',    icon: <Stethoscope size={16}/> },
  { href: '/clinics',        label: 'Clinics',    icon: <Heart size={16}/> },
  { href: '/medicines',      label: 'Medicines',  icon: <Pill size={16}/> },
  { href: '/blood',          label: 'Blood',      icon: <Droplets size={16}/> },
  { href: '/hospitals/map',  label: 'Map',        icon: <Map size={16}/> },
  { href: '/services',       label: 'Services',   icon: <Info size={16}/> },
  { href: '/about',          label: 'About',      icon: <Info size={16}/> },
];

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
    fetch(`${API}/api/v1/auth/me`, { credentials: 'include' })
      .then(res => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className="lc-nav no-print"
        style={{
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
          transition: 'box-shadow 0.25s ease',
        }}
        aria-label="Main navigation"
      >
        <div
          className="page-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 64,
            gap: '1rem',
          }}
        >
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop nav links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.125rem',
              flex: 1,
              marginLeft: '1.5rem',
            }}
            className="hidden-mobile"
            role="list"
          >
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="listitem"
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: isActive(link.href) ? 600 : 500,
                  color: isActive(link.href) ? 'var(--teal)' : 'var(--text-secondary)',
                  background: isActive(link.href) ? 'var(--teal-soft)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {/* Language picker */}
            <div ref={langRef} style={{ position: 'relative' }} className="hidden-mobile">
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.375rem 0.625rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <Globe size={14} />
                {LANGUAGE_OPTIONS.find((l) => l.code === lang)?.label}
                <ChevronDown size={12} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.ul
                    role="listbox"
                    aria-label="Language"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-dropdown)',
                      listStyle: 'none',
                      padding: '0.375rem',
                      margin: 0,
                      minWidth: 130,
                      zIndex: 200,
                    }}
                  >
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <li key={opt.code}>
                        <button
                          role="option"
                          aria-selected={lang === opt.code}
                          onClick={() => { setLang(opt.code); setLangOpen(false); }}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: lang === opt.code ? 'var(--teal-soft)' : 'transparent',
                            color: lang === opt.code ? 'var(--teal)' : 'var(--text-primary)',
                            fontWeight: lang === opt.code ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            textAlign: 'left',
                            transition: 'background 0.12s',
                          }}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <div className="hidden-mobile">
              <ThemeToggle compact />
            </div>

            {/* Auth buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }} className="hidden-mobile">
              {isAuthenticated === true ? (
                <Link
                  href="/citizen/dashboard"
                  style={{
                    padding: '0.4375rem 0.875rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    background: 'var(--teal)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'background 0.15s',
                  }}
                >
                  Dashboard
                </Link>
              ) : isAuthenticated === false ? (
                <>
                  <Link
                    href="/login"
                    style={{
                      padding: '0.4375rem 0.875rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      border: '1.5px solid var(--border)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'background 0.15s, border-color 0.15s',
                      background: 'transparent',
                    }}
                  >
                    <LogIn size={15} />
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      padding: '0.4375rem 0.875rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'white',
                      background: 'var(--teal)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'background 0.15s',
                    }}
                  >
                    <UserPlus size={15} />
                    Create Account
                  </Link>
                </>
              ) : null}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="show-mobile"
              style={{
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border)',
              zIndex: 49,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}
            aria-label="Mobile navigation"
          >
            <div style={{ padding: '0.75rem 1rem 1rem' }}>
              <nav role="navigation">
                {PUBLIC_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0.875rem',
                      borderRadius: '10px',
                      fontSize: '0.9375rem',
                      fontWeight: isActive(link.href) ? 600 : 400,
                      color: isActive(link.href) ? 'var(--teal)' : 'var(--text-primary)',
                      background: isActive(link.href) ? 'var(--teal-soft)' : 'transparent',
                      textDecoration: 'none',
                      marginBottom: '0.125rem',
                    }}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                {/* Language */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setLang(opt.code)}
                      style={{
                        flex: 1,
                        padding: '0.4375rem',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: lang === opt.code ? 'var(--teal)' : 'var(--border)',
                        background: lang === opt.code ? 'var(--teal-soft)' : 'transparent',
                        color: lang === opt.code ? 'var(--teal)' : 'var(--text-secondary)',
                        fontWeight: 500,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isAuthenticated === true ? (
                    <Link href="/citizen/dashboard" style={{ flex: 1, textAlign: 'center' }} className="lc-btn-primary">
                      Dashboard
                    </Link>
                  ) : isAuthenticated === false ? (
                    <>
                      <Link href="/login" style={{ flex: 1, textAlign: 'center' }} className="lc-btn-secondary">
                        Sign In
                      </Link>
                      <Link href="/register" style={{ flex: 1, textAlign: 'center' }} className="lc-btn-primary">
                        Create Account
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 1024px) {
          .hidden-mobile { display: flex !important; align-items: center; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
