'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function HospitalsMapPage() {
  return (
    <div className="page-container" style={{ padding: '2rem 1rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <MapPin size={64} color="var(--teal)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Hospital Map View</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: 600, marginBottom: '2rem' }}>
        The interactive map feature is currently under development. Soon you'll be able to see all verified hospitals and clinics on a live map of Sri Lanka.
      </p>
      <Link href="/hospitals" className="lc-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={18} />
        Back to Directory
      </Link>
    </div>
  );
}
