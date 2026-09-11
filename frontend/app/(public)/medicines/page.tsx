'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pill, Search, AlertCircle, Building2, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AvailabilityBadge, DataFreshnessLabel } from '@/components/Badges';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';

interface MedicineResult {
  _id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  form?: string;
  availability: 'available' | 'limited' | 'low-stock' | 'out-of-stock' | 'unknown';
  lastUpdatedAt: string;
  hospitalId: {
    _id: string;
    officialName: string;
    slug: string;
    district: string;
    province: string;
  };
}

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All Availability' },
  { value: 'available',    label: 'Available' },
  { value: 'limited',      label: 'Limited' },
  { value: 'low-stock',    label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

export default function MedicinesPage() {
  const [results, setResults]     = useState<MedicineResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [availability, setAvailability] = useState('');
  const [district, setDistrict]   = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

  const searchMedicines = useCallback(async () => {
    if (!searchInput.trim()) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const params = new URLSearchParams({ search: searchInput.trim() });
      if (availability) params.set('availability', availability);
      if (district)     params.set('district', district);
      const res = await fetch(`${API}/api/v1/medicines?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setResults(json.medicines || []);
    } catch {
      setError('Failed to load medicine data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchInput, availability, district, API]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMedicines();
  };

  // Fallback sample data while backend is bootstrapping
  const SAMPLE_MEDICINES = [
    { name: 'Metformin 500mg',   generic: 'Metformin Hydrochloride', hospital: 'Base Hospital Kinniya',                  district: 'Trincomalee', avail: 'available' as const },
    { name: 'Amlodipine 5mg',    generic: 'Amlodipine Besylate',     hospital: 'District General Hospital Trincomalee',  district: 'Trincomalee', avail: 'limited' as const },
    { name: 'Omeprazole 20mg',   generic: 'Omeprazole',              hospital: 'Teaching Hospital Jaffna',               district: 'Jaffna',      avail: 'available' as const },
    { name: 'Atorvastatin 10mg', generic: 'Atorvastatin Calcium',    hospital: 'National Hospital Kandy',                district: 'Kandy',       avail: 'available' as const },
    { name: 'Paracetamol 500mg', generic: 'Acetaminophen',           hospital: 'Teaching Hospital Karapitiya',           district: 'Galle',       avail: 'available' as const },
    { name: 'Salbutamol Inhaler',generic: 'Salbutamol',              hospital: 'National Hospital of Sri Lanka',          district: 'Colombo',     avail: 'low-stock' as const },
    { name: 'Amoxicillin 500mg', generic: 'Amoxicillin Trihydrate',  hospital: 'Teaching Hospital Anuradhapura',         district: 'Anuradhapura',avail: 'available' as const },
    { name: 'Frusemide 40mg',    generic: 'Furosemide',              hospital: 'Teaching Hospital Ratnapura',            district: 'Ratnapura',   avail: 'out-of-stock' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <main id="main-content" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Medicine Finder</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Search for medicine availability at government hospitals across Sri Lanka.
                Data is updated by pharmacy staff at each hospital.
              </p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search medicine name or generic name…"
                  aria-label="Search medicines"
                  className="lc-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="lc-input"
                style={{ flex: '0 1 180px', cursor: 'pointer' }}
                aria-label="Filter by availability"
              >
                {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Button type="submit" variant="primary" style={{ borderRadius: 10, flexShrink: 0 }}>
                <Search size={16} /> Search
              </Button>
            </form>

            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#92400E' }}>
              ⚠️ Medicine availability data is updated by pharmacy staff and may not reflect real-time stock levels. Always confirm with the hospital pharmacy before visiting.
            </div>

            {/* Results */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={72} borderRadius={12} />)}
              </div>
            ) : error ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem' }} role="alert">
                <AlertCircle size={18} color="#DC2626" />
                <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{error}</span>
              </div>
            ) : searched && results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Pill size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                <h2 style={{ fontWeight: 700 }}>No medicines found</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Try searching with a different name or generic name.</p>
              </div>
            ) : results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{searchInput}&rdquo;
                </p>
                {results.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="lc-card"
                    style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.medicineName}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {[m.genericName, m.strength, m.form].filter(Boolean).join(' · ')}
                      </div>
                      <Link
                        href={`/hospitals/${m.hospitalId?.slug}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--teal)', textDecoration: 'none', marginTop: '0.25rem' }}
                      >
                        <Building2 size={12} /> {m.hospitalId?.officialName}
                      </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <AvailabilityBadge level={m.availability} />
                      <DataFreshnessLabel level="recent" lastUpdated={m.lastUpdatedAt} compact />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Default: show sample data with disclaimer */
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <strong>Sample data</strong> — Enter a medicine name above to search live hospital inventory.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {SAMPLE_MEDICINES.map((m, i) => (
                      <div
                        key={i}
                        className="lc-card"
                        style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', opacity: 0.7 }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>{m.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{m.generic}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            <Building2 size={12} style={{ verticalAlign: 'middle' }} /> {m.hospital}
                          </div>
                        </div>
                        <AvailabilityBadge level={m.avail} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

    </div>
  );
}
