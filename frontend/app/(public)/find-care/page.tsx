'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';

export default function FindCarePublicPage() {
  const [symptom, setSymptom] = useState('');

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Find the Right Care</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Tell us your symptoms or what you're looking for, and we'll guide you to the right government facility.
        </p>
      </motion.div>

      <div className="lc-card" style={{ padding: '2.5rem', marginBottom: '3rem', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--teal-soft) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>What are you experiencing today?</h2>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <Input 
            id="symptom"
            placeholder="e.g. Persistent headache, Chest pain, Eye infection..." 
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          />
          <Button variant="primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem' }}>
            <Search size={18} /> Find Recommendation
          </Button>
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['Fever', 'Diabetes Check', 'Eye Vision', 'Pregnancy', 'Dental'].map(tag => (
            <span key={tag} style={{ padding: '0.5rem 1rem', background: 'var(--bg-card)', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal)', border: '1px solid var(--teal)', cursor: 'pointer' }} onClick={() => setSymptom(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link href="/emergency" style={{ textDecoration: 'none' }}>
          <div className="lc-card" style={{ padding: '2rem', border: '2px solid #FEE2E2', cursor: 'pointer', height: '100%' }}>
            <ShieldAlert size={32} color="#DC2626" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.5rem' }}>Emergency Care</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Severe symptoms requiring immediate attention at the nearest Accident & Emergency (A&E) unit.</p>
            <div style={{ color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>View Emergency Units <ArrowRight size={16} /></div>
          </div>
        </Link>
        <Link href="/clinics" style={{ textDecoration: 'none' }}>
          <div className="lc-card" style={{ padding: '2rem', cursor: 'pointer', height: '100%' }}>
            <MapPin size={32} color="var(--teal)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Specialist Clinics</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Book an appointment for non-urgent specialist consultations and ongoing care.</p>
            <div style={{ color: 'var(--teal)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Browse Clinics <ArrowRight size={16} /></div>
          </div>
        </Link>
      </div>
    </div>
  );
}
