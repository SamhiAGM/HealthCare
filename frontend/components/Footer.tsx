'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const footerLinks = {
  Healthcare: [
    { label: 'Hospitals', href: '/hospitals' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Clinics', href: '/clinics' },
    { label: 'Medicines', href: '/medicines' },
    { label: 'Blood', href: '/blood' },
  ],
  Services: [
    { label: 'Appointments', href: '/citizen/appointments/new' },
    { label: 'Queue Status', href: '/citizen/queue' },
    { label: 'Find Care', href: '/find-care' },
    { label: 'Hospital Map', href: '/hospitals/map' },
    { label: 'Emergency', href: '/emergency' },
  ],
  About: [
    { label: 'About LankaCare', href: '/about' },
    { label: 'Data Sources', href: '/data-sources' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Security', href: '/security' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
  ],
  Help: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--bg-soft)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 0 1.5rem',
        marginTop: 'auto',
      }}
      aria-label="Site footer"
    >
      <div className="page-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: 'span 2', minWidth: 220 }}>
            <Logo size="md" />
            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: 280,
              }}
            >
              Sri Lanka's national digital health platform — connecting citizens with verified healthcare
              services across all 9 provinces.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '1.25rem',
              }}
            >
              <a
                href="mailto:info@lankacare.gov.lk"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                <Mail size={13} />
                info@lankacare.gov.lk
              </a>
              <a
                href="tel:+94112XXXXXX"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                <Phone size={13} />
                +94 112 XXX XXX
              </a>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}
              >
                <MapPin size={13} />
                Ministry of Health, Colombo 10
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.875rem',
                }}
              >
                {title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            &copy; {year} LankaCare — National Digital Health Platform. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-muted)',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              All Systems Operational
            </span>
            <a
              href="https://www.health.gov.lk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              Ministry of Health <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
