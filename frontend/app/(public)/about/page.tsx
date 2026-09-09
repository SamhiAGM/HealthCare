'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Heart, Globe, Users, Database, CheckCircle,
  ArrowRight, MapPin, Phone, Mail, ExternalLink, Building2
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const TEAM_VALUES = [
  { icon: <Shield size={24} />, color: '#0369A1', bg: '#EFF6FF', title: 'Data Integrity', desc: 'All hospital and doctor information is sourced exclusively from Ministry of Health official records. No community-submitted or unverified data.' },
  { icon: <Heart size={24} />, color: '#DC2626', bg: '#FFF1F2', title: 'Citizen-First', desc: 'Every feature is designed to reduce barriers to healthcare access. From Colombo to Kinniya — for every Sri Lankan.' },
  { icon: <Globe size={24} />, color: '#0D9488', bg: '#CCFBF1', title: 'Three Languages', desc: 'English, Sinhala, and Tamil support ensures all citizens can access the platform regardless of language.' },
  { icon: <Users size={24} />, color: '#7C3AED', bg: '#F5F3FF', title: 'All Provinces', desc: 'All 9 provinces and 25 districts are covered. Rural and remote communities are a priority.' },
  { icon: <Database size={24} />, color: '#D97706', bg: '#FFFBEB', title: 'Transparency', desc: 'We show exactly what data we have, when it was last updated, and when we don\'t have information. No false claims.' },
  { icon: <CheckCircle size={24} />, color: '#16A34A', bg: '#F0FDF4', title: 'Open Standards', desc: 'Built on open-source technologies. WCAG 2.2 accessible. Works on any device, even on low-bandwidth connections.' },
];

const PROVINCES_LIST = [
  { name: 'Western Province',       hospitals: 16, capital: 'Colombo' },
  { name: 'Central Province',       hospitals: 9,  capital: 'Kandy' },
  { name: 'Southern Province',      hospitals: 9,  capital: 'Galle' },
  { name: 'Northern Province',      hospitals: 7,  capital: 'Jaffna' },
  { name: 'Eastern Province',       hospitals: 11, capital: 'Trincomalee' },
  { name: 'North Western Province', hospitals: 6,  capital: 'Kurunegala' },
  { name: 'North Central Province', hospitals: 4,  capital: 'Anuradhapura' },
  { name: 'Uva Province',           hospitals: 5,  capital: 'Badulla' },
  { name: 'Sabaragamuwa Province',  hospitals: 6,  capital: 'Ratnapura' },
];

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <main id="main-content">
        {/* Hero */}
        <section style={{ padding: '4rem 0 3rem', background: 'linear-gradient(135deg, #082F49, #0F766E)', color: 'white' }}>
          <div className="page-container" style={{ textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                <Building2 size={14} /> Sri Lanka National Digital Health Platform
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                About LankaCare
              </h1>
              <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                LankaCare is Sri Lanka&apos;s national digital healthcare platform, connecting citizens with
                verified government health services across all 9 provinces and 25 districts.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section style={{ padding: '4rem 0' }}>
          <div className="page-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '1rem' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '1rem' }}>
                  Sri Lanka has world-class government hospitals — but accessing the right care at the right
                  time remains a challenge for many citizens. Long queues, uncertain wait times, medicine
                  availability gaps, and limited appointment information create unnecessary friction.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>
                  LankaCare bridges this gap. By digitising healthcare information access, enabling online
                  appointment booking, real-time queue tracking, and medicine availability — we help every
                  Sri Lankan citizen make better healthcare decisions.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { value: '51+',  label: 'Gov. Hospitals',      color: '#0369A1' },
                    { value: '9',    label: 'Provinces',            color: '#0D9488' },
                    { value: '25',   label: 'Districts',            color: '#7C3AED' },
                    { value: '2026', label: 'Platform Launch Year', color: '#D97706' },
                  ].map(({ value, label, color }) => (
                    <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: '0.375rem' }}>{value}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: '4rem 0', background: 'var(--bg-soft)' }}>
          <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>Our Principles</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                These principles guide every decision we make in building LankaCare.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {TEAM_VALUES.map(({ icon, color, bg, title, desc }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="lc-card"
                  style={{ padding: '1.5rem' }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>{icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Province coverage */}
        <section style={{ padding: '4rem 0' }}>
          <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>National Coverage</h2>
              <p style={{ color: 'var(--text-secondary)' }}>All 9 provinces of Sri Lanka</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {PROVINCES_LIST.map(({ name, hospitals, capital }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="lc-card"
                  style={{ padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-soft)', padding: '0.125rem 0.5rem', borderRadius: 999 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {hospitals} hospitals
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} /> {capital}
                  </p>
                  <Link
                    href={`/hospitals?province=${encodeURIComponent(name)}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', marginTop: '0.5rem' }}
                  >
                    View hospitals <ArrowRight size={12} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: '4rem 0', background: 'var(--bg-soft)' }}>
          <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Get In Touch</h2>
              <p style={{ color: 'var(--text-secondary)' }}>For inquiries, data corrections, or partnership requests</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: 720, margin: '0 auto' }}>
              {[
                { icon: <Mail size={22} />, label: 'Email',    value: 'info@lankacare.gov.lk',       href: 'mailto:info@lankacare.gov.lk', color: '#0369A1' },
                { icon: <Phone size={22} />, label: 'Phone',   value: '+94 112 XXX XXX',             href: 'tel:+94112XXXXXX',             color: '#0D9488' },
                { icon: <MapPin size={22} />, label: 'Office', value: 'Ministry of Health, Colombo 10', href: null,                          color: '#7C3AED' },
                { icon: <ExternalLink size={22} />, label: 'Ministry', value: 'www.health.gov.lk', href: 'https://www.health.gov.lk', color: '#D97706' },
              ].map(({ icon, label, value, href, color }) => (
                <div key={label} className="lc-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{value}</a>
                  ) : (
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
