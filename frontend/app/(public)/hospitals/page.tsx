'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Building2, MapPin, Phone, Navigation,
  X, ChevronDown, SlidersHorizontal, Map, AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HospitalCardSkeleton } from '@/components/Skeleton';
import { VerificationBadge, AvailabilityBadge } from '@/components/Badges';
import { Button } from '@/components/Button';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Hospital {
  _id: string;
  officialName: string;
  shortName?: string;
  slug: string;
  province: string;
  district: string;
  hospitalType: string;
  address?: string;
  phoneNumbers?: string[];
  latitude?: number | null;
  longitude?: number | null;
  emergencyAvailable?: boolean | null;
  pharmacyAvailable?: boolean | null;
  laboratoryAvailable?: boolean | null;
  bloodBankAvailable?: boolean | null;
  verificationStatus: 'Verified' | 'Pending' | 'Unverified';
}

/* ─── Province / District data for filters ──────────────────────────── */
const PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province',
  'Northern Province', 'Eastern Province', 'North Western Province',
  'North Central Province', 'Uva Province', 'Sabaragamuwa Province',
];

const DISTRICTS: Record<string, string[]> = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'Eastern Province': ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle'],
};

const HOSPITAL_TYPES = [
  'National Hospital', 'Specialized Teaching Hospital', 'Teaching Hospital',
  'District General Hospital', 'Base Hospital Type A', 'Base Hospital Type B',
  'Specialized Hospital', 'Provincial General Hospital',
];

function getHospitalTypeClass(type: string): string {
  if (type.includes('National'))  return 'hosp-national';
  if (type.includes('Teaching'))  return 'hosp-teaching';
  if (type.includes('District'))  return 'hosp-district';
  if (type.includes('Type A'))    return 'hosp-base-a';
  if (type.includes('Type B'))    return 'hosp-base-b';
  if (type.includes('Provincial'))return 'hosp-provincial';
  return 'hosp-district';
}

/* ─── Hospital Card ──────────────────────────────────────────────────── */
function HospitalCard({ hospital }: { hospital: Hospital }) {
  const services = [
    hospital.emergencyAvailable  && { label: 'Emergency',   color: '#DC2626' },
    hospital.pharmacyAvailable   && { label: 'Pharmacy',    color: '#0369A1' },
    hospital.laboratoryAvailable && { label: 'Laboratory',  color: '#7C3AED' },
    hospital.bloodBankAvailable  && { label: 'Blood Bank',  color: '#BE123C' },
  ].filter(Boolean) as { label: string; color: string }[];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="lc-card"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className={`lc-badge ${getHospitalTypeClass(hospital.hospitalType)}`} style={{ fontSize: '0.7rem', marginBottom: '0.375rem', display: 'inline-flex' }}>
            {hospital.hospitalType}
          </span>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
            {hospital.officialName}
          </h3>
        </div>
        <VerificationBadge status={hospital.verificationStatus} />
      </div>

      {/* Location */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <MapPin size={13} /> {hospital.district}, {hospital.province.replace(' Province', '')}
        </span>
        {hospital.phoneNumbers && hospital.phoneNumbers[0] && (
          <a href={`tel:${hospital.phoneNumbers[0]}`} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <Phone size={13} /> {hospital.phoneNumbers[0]}
          </a>
        )}
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {services.map(({ label, color }) => (
            <span
              key={label}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.25rem 0.5rem',
                borderRadius: '999px',
                background: `${color}15`,
                color,
                border: `1px solid ${color}30`,
              }}
            >
              {label}
            </span>
          ))}
          {services.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service information not available</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <Link
          href={`/hospitals/${hospital.slug}`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.5rem 0.75rem',
            background: 'var(--teal)',
            color: 'white',
            borderRadius: 10,
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          View Details
        </Link>
        {hospital.latitude && hospital.longitude && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${hospital.latitude}&mlon=${hospital.longitude}&zoom=16`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get directions to ${hospital.officialName}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--bg-muted)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: '0.8125rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <Navigation size={13} /> Directions
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Filters
  const [search, setSearch]       = useState('');
  const [province, setProvince]   = useState('');
  const [district, setDistrict]   = useState('');
  const [type, setType]           = useState('');
  const [emergency, setEmergency] = useState(false);
  const [pharmacy, setPharmacy]   = useState(false);
  const [laboratory, setLaboratory] = useState(false);
  const [bloodBank, setBloodBank] = useState(false);
  const [sort, setSort]           = useState('name');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search)    params.set('search',    search);
      if (province)  params.set('province',  province);
      if (district)  params.set('district',  district);
      if (type)      params.set('type',      type);
      if (emergency) params.set('emergency', 'true');
      if (pharmacy)  params.set('pharmacy',  'true');
      if (laboratory)params.set('laboratory','true');
      if (bloodBank) params.set('bloodBank', 'true');
      params.set('sort',  sort);
      params.set('page',  String(page));
      params.set('limit', '18');

      const res = await fetch(`${API_BASE}/api/v1/hospitals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch hospitals');
      const json = await res.json();
      setHospitals(json.hospitals || []);
      setTotal(json.pagination?.total || 0);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch {
      setError('Unable to load hospitals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [search, province, district, type, emergency, pharmacy, laboratory, bloodBank, sort, page, API_BASE]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setSearchInput('');
    setProvince(''); setDistrict(''); setType('');
    setEmergency(false); setPharmacy(false); setLaboratory(false); setBloodBank(false);
    setSort('name'); setPage(1);
  };

  const hasFilters = search || province || district || type || emergency || pharmacy || laboratory || bloodBank;
  const availableDistricts = province ? (DISTRICTS[province] || []) : Object.values(DISTRICTS).flat();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <main id="main-content" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="page-container">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Hospital Directory
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  {loading ? 'Loading…' : `${total.toLocaleString()} verified Sri Lankan government hospitals`}
                </p>
              </div>
              <Link
                href="/hospitals/map"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                }}
              >
                <Map size={16} /> View Map
              </Link>
            </div>
          </motion.div>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by hospital name, district, province…"
                aria-label="Search hospitals"
                className="lc-input"
                style={{ paddingLeft: '2.75rem', paddingRight: searchInput ? '2.75rem' : undefined }}
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>
            <Button type="submit" variant="primary" style={{ borderRadius: 10, flexShrink: 0 }}>Search</Button>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
              aria-label="Toggle filters"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0 0.875rem',
                background: hasFilters ? 'var(--teal-soft)' : 'var(--bg-card)',
                border: `1.5px solid ${hasFilters ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: 10,
                color: hasFilters ? 'var(--teal)' : 'var(--text-primary)',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasFilters && <span style={{ background: 'var(--teal)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>!</span>}
            </button>
          </form>

          {/* Filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', marginBottom: '1.25rem' }}
              >
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {/* Province */}
                  <div>
                    <label htmlFor="filter-province" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Province</label>
                    <select id="filter-province" value={province} onChange={(e) => { setProvince(e.target.value); setDistrict(''); setPage(1); }} className="lc-input" style={{ cursor: 'pointer' }}>
                      <option value="">All Provinces</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="filter-district" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>District</label>
                    <select id="filter-district" value={district} onChange={(e) => { setDistrict(e.target.value); setPage(1); }} className="lc-input" style={{ cursor: 'pointer' }}>
                      <option value="">All Districts</option>
                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label htmlFor="filter-type" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Hospital Type</label>
                    <select id="filter-type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="lc-input" style={{ cursor: 'pointer' }}>
                      <option value="">All Types</option>
                      {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label htmlFor="filter-sort" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Sort By</label>
                    <select id="filter-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="lc-input" style={{ cursor: 'pointer' }}>
                      <option value="name">Name (A–Z)</option>
                      <option value="district">District</option>
                      <option value="type">Hospital Type</option>
                    </select>
                  </div>

                  {/* Service toggles */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Services</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {[
                        { label: 'Emergency',  val: emergency,  set: setEmergency },
                        { label: 'Pharmacy',   val: pharmacy,   set: setPharmacy },
                        { label: 'Laboratory', val: laboratory, set: setLaboratory },
                        { label: 'Blood Bank', val: bloodBank,  set: setBloodBank },
                      ].map(({ label, val, set }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => { set(!val); setPage(1); }}
                          aria-pressed={val}
                          style={{
                            padding: '0.375rem 0.875rem',
                            borderRadius: '999px',
                            border: '1.5px solid',
                            borderColor: val ? 'var(--teal)' : 'var(--border)',
                            background: val ? 'var(--teal-soft)' : 'transparent',
                            color: val ? 'var(--teal)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear */}
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={clearFilters}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '0.5rem 0.875rem',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      <X size={14} /> Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          {error && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }} role="alert">
              <AlertCircle size={18} color="#DC2626" />
              <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{error}</span>
              <button onClick={fetchHospitals} style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#DC2626', background: 'none', border: '1px solid #DC2626', borderRadius: 6, padding: '0.25rem 0.625rem', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 9 }).map((_, i) => <HospitalCardSkeleton key={i} />)}
            </div>
          ) : hospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <Building2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No hospitals found</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
              <button onClick={clearFilters} style={{ marginTop: '1rem', cursor: 'pointer', background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 10, padding: '0.625rem 1.25rem', fontWeight: 600 }}>Clear Filters</button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}
              >
                {hospitals.map((h) => <HospitalCard key={h._id} hospital={h} />)}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: page === 1 ? 'var(--bg-muted)' : 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: page === totalPages ? 'var(--bg-muted)' : 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
