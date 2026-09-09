'use client';

import { Phone, AlertTriangle, Ambulance, MapPin } from 'lucide-react';
import { Button } from '@/components/Button';

export default function EmergencyPublicPage() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: '#FEF2F2', border: '2px solid #FEE2E2', borderRadius: 16, padding: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
        <AlertTriangle size={64} color="#DC2626" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#991B1B', marginBottom: '1rem' }}>Are you in a medical emergency?</h1>
        <p style={{ fontSize: '1.25rem', color: '#B91C1C', marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
          If you are experiencing a life-threatening medical emergency, call for an ambulance immediately. Do not wait for an e-Appointment.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: '#DC2626', color: 'white', padding: '1rem 3rem', borderRadius: 999, fontSize: '2.5rem', fontWeight: 800 }}>
          <Phone size={36} /> 1990
        </div>
        <p style={{ marginTop: '1rem', color: '#991B1B', fontWeight: 600 }}>Suwaseriya Free Ambulance Service</p>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Nearest 24/7 Emergency Units (A&E)</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Button variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} /> Use My Location
        </Button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {[
          { name: 'National Hospital of Sri Lanka', district: 'Colombo', distance: '1.2 km', type: 'Level 1 Trauma Center' },
          { name: 'Colombo South Teaching Hospital (Kalubowila)', district: 'Colombo', distance: '6.5 km', type: 'Teaching Hospital' },
          { name: 'Sri Jayewardenepura General Hospital', district: 'Colombo', distance: '8.3 km', type: 'General Hospital' },
        ].map((h, i) => (
          <div key={i} className="lc-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{h.name}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FEF2F2', color: '#DC2626', padding: '0.25rem 0.5rem', borderRadius: 999 }}>{h.type}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{h.district} District</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{h.distance}</div>
              <div style={{ color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <MapPin size={14} /> Get Directions
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
