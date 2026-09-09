'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';

export default function FAQPublicPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'How do I book an e-Appointment?', a: 'You can book an e-Appointment by creating a Citizen account, logging in, and selecting "Book Appointment" from your dashboard. Choose your preferred hospital, clinic, and available date.' },
    { q: 'Is this service available for all hospitals in Sri Lanka?', a: 'Currently, the service is rolled out to 51 major government hospitals including National Hospitals, Teaching Hospitals, and District General Hospitals. Base hospitals are being added in phases.' },
    { q: 'What happens if I miss my appointment time?', a: 'If you miss your allocated token time, your status will change to "Missed" and you will need to re-book or speak to the hospital front desk to be added as a walk-in at the end of the queue.' },
    { q: 'How does the Live Queue Tracker work?', a: 'Once you check-in at the hospital by scanning the QR code on your e-Ticket, you will be assigned a token number. You can monitor the currently serving number directly from your phone to know exactly when to approach the doctor\'s room.' },
    { q: 'Can I view my past medical records?', a: 'Yes. All diagnoses, prescriptions, and lab results issued through connected hospitals are securely stored in your Digital Health Wallet accessible via your Citizen Dashboard.' },
  ];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <HelpCircle size={48} color="var(--teal)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Everything you need to know about using the LankaCare digital health platform.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, i) => (
          <div key={i} className="lc-card" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{ width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: openIndex === i ? 'var(--teal)' : 'var(--text-primary)' }}>{faq.q}</span>
              <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }}>
                <ChevronDown size={20} color="var(--text-muted)" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--teal-soft)', borderRadius: 16, textAlign: 'center' }}>
        <MessageCircle size={32} color="var(--teal)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Still need help?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Our support team is available 24/7 to assist you with any technical issues.</p>
        <button style={{ padding: '0.75rem 2rem', background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
          Contact Support
        </button>
      </div>
    </div>
  );
}
