'use client';

import { motion } from 'framer-motion';
import { Stethoscope, Activity, FileText, Smartphone, Shield, Users } from 'lucide-react';

export default function ServicesPublicPage() {
  const services = [
    { title: 'e-Appointments', desc: 'Book hospital and clinic visits completely online, eliminating physical queues.', icon: <Smartphone size={24} /> },
    { title: 'Live Queue Tracking', desc: 'Monitor your clinic queue token status in real-time from your mobile phone.', icon: <Activity size={24} /> },
    { title: 'Digital Health Records', desc: 'Your entire medical history, securely stored and accessible to any government hospital.', icon: <FileText size={24} /> },
    { title: 'Specialist Directory', desc: 'Find specialized doctors and consultants across the national hospital network.', icon: <Stethoscope size={24} /> },
    { title: 'Blood & Medicine Sync', desc: 'Live availability checks for essential medicines and critical blood units.', icon: <Shield size={24} /> },
    { title: 'Caregiver Accounts', desc: 'Manage appointments and health records for your children or elderly parents.', icon: <Users size={24} /> },
  ];

  return (
    <div style={{ padding: '4rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Our Services</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto' }}>
          Discover the digital features powering the new era of Sri Lanka's healthcare system.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {services.map((service, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="lc-card"
            style={{ padding: '2rem' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--teal-soft)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {service.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{service.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{service.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
