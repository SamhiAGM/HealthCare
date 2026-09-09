'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Droplets, MapPin, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BloodStatusBadge, DataFreshnessLabel } from '@/components/Badges';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
type BloodGroup = typeof BLOOD_GROUPS[number];

// Sample data structured per spec — clearly labelled as sample
const BLOOD_DATA = [
  { hospital: 'National Hospital of Sri Lanka',     slug: 'national-hospital-of-sri-lanka',    district: 'Colombo',        blood: { 'A+': 'adequate', 'A-': 'low',      'B+': 'adequate', 'B-': 'moderate', 'AB+': 'adequate', 'AB-': 'low',      'O+': 'adequate', 'O-': 'critical' } },
  { hospital: 'Teaching Hospital Peradeniya',        slug: 'teaching-hospital-peradeniya',       district: 'Kandy',          blood: { 'A+': 'adequate', 'A-': 'moderate', 'B+': 'moderate', 'B-': 'low',      'AB+': 'low',      'AB-': 'critical', 'O+': 'adequate', 'O-': 'low' } },
  { hospital: 'Teaching Hospital Karapitiya',        slug: 'teaching-hospital-karapitiya',       district: 'Galle',          blood: { 'A+': 'moderate', 'A-': 'low',      'B+': 'adequate', 'B-': 'low',      'AB+': 'moderate', 'AB-': 'low',      'O+': 'adequate', 'O-': 'moderate' } },
  { hospital: 'Teaching Hospital Jaffna',            slug: 'teaching-hospital-jaffna',           district: 'Jaffna',         blood: { 'A+': 'adequate', 'A-': 'adequate', 'B+': 'adequate', 'B-': 'moderate', 'AB+': 'low',      'AB-': 'low',      'O+': 'adequate', 'O-': 'low' } },
  { hospital: 'Teaching Hospital Batticaloa',        slug: 'teaching-hospital-batticaloa',       district: 'Batticaloa',     blood: { 'A+': 'moderate', 'A-': 'low',      'B+': 'adequate', 'B-': 'critical', 'AB+': 'low',      'AB-': 'critical', 'O+': 'moderate', 'O-': 'critical' } },
  { hospital: 'Teaching Hospital Anuradhapura',      slug: 'teaching-hospital-anuradhapura',     district: 'Anuradhapura',   blood: { 'A+': 'adequate', 'A-': 'moderate', 'B+': 'adequate', 'B-': 'low',      'AB+': 'adequate', 'AB-': 'low',      'O+': 'adequate', 'O-': 'moderate' } },
  { hospital: 'District General Hospital Trincomalee',slug: 'district-general-hospital-trincomalee',district: 'Trincomalee', blood: { 'A+': 'moderate', 'A-': 'low',      'B+': 'moderate', 'B-': 'low',      'AB+': 'adequate', 'AB-': 'critical', 'O+': 'moderate', 'O-': 'low' } },
] as const;

const STATUS_COLORS: Record<string, string> = {
  adequate: '#16A34A',
  moderate: '#0284C7',
  low:      '#D97706',
  critical: '#DC2626',
};

export default function BloodPage() {
  const [filter, setFilter]   = useState<BloodGroup | ''>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'critical' | 'low'>('');

  const filteredData = BLOOD_DATA.filter(h => {
    if (statusFilter === 'critical') return Object.values(h.blood).some(s => s === 'critical');
    if (statusFilter === 'low')      return Object.values(h.blood).some(s => s === 'low' || s === 'critical');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <main id="main-content" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Blood Availability</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track blood group availability at government blood banks across Sri Lanka.</p>
              </div>
              <Link
                href="/blood/donate"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.125rem',
                  background: '#DC2626',
                  color: 'white',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                <Droplets size={16} /> Become a Donor
              </Link>
            </div>

            {/* Disclaimer */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#92400E', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Blood availability levels are indicative only. In critical emergencies, contact the blood bank directly before travelling. <strong>Emergency: 1990</strong></span>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as BloodGroup | '')}
                className="lc-input"
                style={{ maxWidth: 160, cursor: 'pointer' }}
                aria-label="Filter by blood group"
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="lc-input"
                style={{ maxWidth: 200, cursor: 'pointer' }}
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="critical">Show Critical Only</option>
                <option value="low">Show Low or Critical</option>
              </select>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {Object.entries(STATUS_COLORS).map(([label, color]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </span>
              ))}
            </div>

            {/* Data note */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <DataFreshnessLabel level="static" label="ILLUSTRATIVE DATA" />
            </div>

            {/* Blood bank table (responsive) */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.375rem' }} aria-label="Blood availability by hospital">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Hospital</th>
                    {BLOOD_GROUPS.map(g => (
                      <th
                        key={g}
                        style={{
                          padding: '0.5rem 0.625rem',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: filter === g ? 'var(--teal)' : 'var(--text-muted)',
                          textAlign: 'center',
                          minWidth: 52,
                        }}
                      >
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((h, i) => (
                    <motion.tr
                      key={h.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ background: 'var(--bg-card)', borderRadius: 12 }}
                    >
                      <td style={{ padding: '0.75rem 1rem', borderRadius: '12px 0 0 12px', border: '1px solid var(--border)', borderRight: 'none' }}>
                        <Link
                          href={`/hospitals/${h.slug}`}
                          style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                        >
                          {h.hospital}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={11} /> {h.district}
                        </span>
                      </td>
                      {BLOOD_GROUPS.map((g, j) => {
                        const status = (h.blood as any)[g];
                        const isHighlight = !filter || filter === g;
                        return (
                          <td
                            key={g}
                            style={{
                              padding: '0.75rem 0.625rem',
                              textAlign: 'center',
                              border: '1px solid var(--border)',
                              borderLeft: 'none',
                              borderRight: j === BLOOD_GROUPS.length - 1 ? '1px solid var(--border)' : 'none',
                              borderRadius: j === BLOOD_GROUPS.length - 1 ? '0 12px 12px 0' : 0,
                              opacity: isHighlight ? 1 : 0.3,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: STATUS_COLORS[status] || 'var(--border)',
                              }}
                              title={status}
                              aria-label={`${g}: ${status}`}
                            />
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA */}
            <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, #FFF1F2, #FEF2F2)', border: '1px solid #FEE2E2', borderRadius: 18, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.375rem' }}>Save Lives. Become a Blood Donor.</h2>
                <p style={{ fontSize: '0.875rem', color: '#B91C1C' }}>Register as a donor and be notified when your blood type is critically needed.</p>
              </div>
              <Link
                href="/blood/donate"
                style={{ padding: '0.625rem 1.25rem', background: '#DC2626', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Droplets size={16} /> Register as Donor
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  );
}
