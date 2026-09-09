'use client';

import { FileText } from 'lucide-react';

export default function TermsPublicPage() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <FileText size={48} color="var(--teal)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Terms of Service</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="lc-card" style={{ padding: '2.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '2rem' }}>
          By accessing and using the LankaCare platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the system.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>2. E-Appointments & Attendance</h2>
        <p style={{ marginBottom: '2rem' }}>
          An e-Appointment guarantees a slot in the clinic queue for the specified day. However, exact consultation times are estimates. Users must arrive at the hospital and check-in via QR code at least 15 minutes prior to their estimated time.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>3. Medical Emergencies</h2>
        <p style={{ marginBottom: '2rem' }}>
          LankaCare e-Appointments are NOT for medical emergencies. In an emergency, dial 1990 or proceed immediately to the nearest hospital Accident & Emergency (A&E) unit.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>4. System Misuse</h2>
        <p style={{ marginBottom: '0' }}>
          Accounts found to be maliciously booking and abandoning appointments (no-shows) repeatedly may be temporarily suspended to ensure fair access to healthcare for all citizens.
        </p>
      </div>
    </div>
  );
}
