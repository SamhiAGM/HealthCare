'use client';

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function ContactPublicPage() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Contact Us</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          Get in touch with the Ministry of Health Digital Services Division.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="lc-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send us a message</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input id="name" label="Full Name" />
              <Input id="email" label="Email Address" type="email" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="message" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Message</label>
                <textarea id="message" rows={5} className="lc-input" style={{ resize: 'vertical' }}></textarea>
              </div>
              <Button variant="primary" style={{ marginTop: '0.5rem' }}>Send Message</Button>
            </form>
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="lc-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--teal-soft)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ministry Headquarters</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Ministry of Health,<br />"Suwasiripaya",<br />385, Rev. Baddegama Wimalawansa Thero Mawatha,<br />Colombo 10, Sri Lanka.</p>
            </div>
          </div>

          <div className="lc-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Phone Support</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>General Hotline: +94 11 269 4033</p>
              <p style={{ color: 'var(--text-secondary)' }}>Digital Helpdesk: 1999</p>
            </div>
          </div>

          <div className="lc-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3E8FF', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Email Us</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>support@health.gov.lk</p>
              <p style={{ color: 'var(--text-secondary)' }}>info@lankacare.lk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
