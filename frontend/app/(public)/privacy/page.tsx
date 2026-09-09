'use client';

import { Shield } from 'lucide-react';

export default function PrivacyPublicPage() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Shield size={48} color="var(--teal)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="lc-card" style={{ padding: '2.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0', marginBottom: '1rem' }}>1. Introduction</h2>
        <p style={{ marginBottom: '2rem' }}>
          The Ministry of Health, Sri Lanka ("we", "our", or "us") is committed to protecting your privacy and ensuring the security of your medical and personal data on the LankaCare platform.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>2. Data Collection</h2>
        <p style={{ marginBottom: '2rem' }}>
          We collect personal information including your National Identity Card (NIC) number, contact details, and medical history when you use the LankaCare platform to book appointments or access hospital services.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>3. Data Usage</h2>
        <p style={{ marginBottom: '2rem' }}>
          Your data is used strictly for providing healthcare services, managing hospital queues, and maintaining accurate medical records across the national healthcare network. Anonymized data may be used for national health analytics.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>4. Data Security</h2>
        <p style={{ marginBottom: '0' }}>
          All data is encrypted in transit and at rest. Access to your medical records is strictly limited to authorized medical personnel actively involved in your care.
        </p>
      </div>
    </div>
  );
}
