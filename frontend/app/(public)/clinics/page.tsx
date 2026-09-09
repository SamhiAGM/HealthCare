'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function ClinicsPublicPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const clinics = [
    { id: 1, name: 'Cardiology Clinic', hospital: 'National Hospital of Sri Lanka', district: 'Colombo', day: 'Monday, Wednesday', time: '08:00 - 12:00' },
    { id: 2, name: 'ENT Clinic', hospital: 'Teaching Hospital Karapitiya', district: 'Galle', day: 'Tuesday, Friday', time: '13:00 - 16:00' },
    { id: 3, name: 'Eye Clinic', hospital: 'Teaching Hospital Jaffna', district: 'Jaffna', day: 'Monday, Thursday', time: '08:00 - 12:00' },
    { id: 4, name: 'Pediatric Clinic', hospital: 'District General Hospital Gampaha', district: 'Gampaha', day: 'Wednesday, Saturday', time: '09:00 - 13:00' },
  ];

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Find a Government Clinic</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          Browse specialty clinics across all connected government hospitals in Sri Lanka and book your e-Appointments.
        </p>
      </motion.div>

      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--border)', marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <Input 
            label="Search Clinic Name or Specialty" 
            id="search" 
            placeholder="e.g. Cardiology, Eye..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>District</label>
          <select className="lc-input">
            <option value="">All Districts</option>
            <option value="Colombo">Colombo</option>
            <option value="Galle">Galle</option>
            <option value="Jaffna">Jaffna</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {clinics.map((clinic, i) => (
          <motion.div 
            key={clinic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="lc-card" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-soft)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{clinic.name}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{clinic.hospital}</div>
                  <div>{clinic.district} District</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Clock size={16} />
                {clinic.day} • {clinic.time}
              </div>
            </div>

            <Button variant="primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              Book Appointment <ArrowRight size={16} />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
