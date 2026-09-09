'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Stethoscope, Search, AlertCircle, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics',
  'Obstetrics & Gynecology', 'Ophthalmology', 'ENT', 'Dermatology',
  'Psychiatry', 'General Medicine', 'General Surgery', 'Urology',
  'Nephrology', 'Endocrinology', 'Gastroenterology', 'Pulmonology',
  'Rheumatology', 'Hematology', 'Radiology', 'Pathology', 'Anesthesiology',
];

export default function DoctorsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <main id="main-content" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
                Doctor Directory
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Find verified doctors by specialty, hospital, and clinic schedule across Sri Lanka.
              </p>
            </div>

            {/* Data transparency notice */}
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 16,
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={22} color="#1D4ED8" style={{ flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF', marginBottom: '0.375rem' }}>
                  Data Transparency Notice
                </h2>
                <p style={{ fontSize: '0.8875rem', color: '#2563EB', lineHeight: 1.65 }}>
                  LankaCare only lists doctors from <strong>verified official Ministry of Health sources</strong>.
                  Detailed doctor profiles, clinic schedules, and contact information will appear here as hospital staff
                  update the system through the hospital administration panel.
                  <br /><br />
                  We do not list unverified or community-submitted doctor information to ensure accuracy and prevent
                  potential misinformation about medical professionals.
                </p>
                <p style={{ marginTop: '0.75rem' }}>
                  <strong style={{ fontSize: '0.875rem', color: '#1D4ED8' }}>For hospitals:</strong>{' '}
                  <Link href="/hospital/login" style={{ color: '#1D4ED8', fontWeight: 600, fontSize: '0.875rem' }}>
                    Hospital Admin Login →
                  </Link>
                </p>
              </div>
            </div>

            {/* Quick search by specialty */}
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Browse by Specialty</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
              {SPECIALTIES.map((s) => (
                <Link
                  key={s}
                  href={`/hospitals?type=&search=${encodeURIComponent(s)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  <Stethoscope size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                  {s}
                </Link>
              ))}
            </div>

            {/* Find via hospital */}
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 18, padding: '2rem', textAlign: 'center' }}>
              <BookOpen size={36} style={{ color: 'var(--teal)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Find Doctors via Hospital Profiles
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                Detailed medical staff directories are available on each hospital&apos;s profile page.
                Browse hospitals to find clinic schedules and available doctors.
              </p>
              <Link
                href="/hospitals"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  background: 'var(--teal)',
                  color: 'white',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Browse Hospitals →
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  );
}
