'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, Phone, Mail, Globe, ArrowLeft,
  Stethoscope, Pill, Clock, Droplets, AlertCircle,
  Navigation, CheckCircle, Calendar, Bed
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/Skeleton';
import { VerificationBadge, AvailabilityBadge, BloodStatusBadge, DataFreshnessLabel } from '@/components/Badges';

interface HospitalDetail {
  hospital: {
    _id: string;
    officialName: string;
    shortName?: string;
    slug: string;
    province: string;
    district: string;
    hospitalType: string;
    address?: string;
    phoneNumbers?: string[];
    email?: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    emergencyAvailable?: boolean;
    pharmacyAvailable?: boolean;
    laboratoryAvailable?: boolean;
    bloodBankAvailable?: boolean;
    services?: string[];
    verificationStatus: 'Verified' | 'Pending' | 'Unverified';
    updatedAt?: string;
  };
  doctors: { _id: string; name?: string; title?: string; specialty?: string; verificationStatus: string; dataAvailable: boolean }[];
  clinics: { _id: string; name: string; day: string; startTime: string; endTime: string; bookingOpen: boolean; status: string; capacity?: number }[];
  beds: { wardType: string; available: number; total: number; publicStatus: string; lastUpdatedAt: string }[];
  blood: { bloodGroup: string; status: string; lastUpdatedAt: string }[];
  medicines: { medicineName: string; genericName?: string; strength?: string; form?: string; availability: string; lastUpdatedAt: string }[];
}

export default function HospitalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<HospitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'clinics' | 'beds' | 'blood' | 'medicines' | 'staff'>('overview');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await fetch(`${API}/api/v1/hospitals/${slug}`);
        if (res.status === 404) { setError('Hospital not found'); return; }
        if (!res.ok) throw new Error('Failed to load');
        setData(await res.json());
      } catch {
        setError('Failed to load hospital data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [slug, API]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <main style={{ flex: 1, padding: '2rem 0' }}>
          <div className="page-container">
            <Skeleton height={32} width="50%" borderRadius={8} />
            <div style={{ height: '1rem' }} />
            <Skeleton height={18} width="30%" borderRadius={6} />
            <div style={{ height: '2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[1,2,3,4].map(i => <Skeleton key={i} height={80} borderRadius={12} />)}
            </div>
          </div>
        </main>

      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{error || 'Hospital not found'}</h1>
          <Link href="/hospitals" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>← Back to Hospital Directory</Link>
        </main>

      </div>
    );
  }

  const { hospital, doctors, clinics, beds, blood, medicines } = data;
  const TAB_COUNTS = {
    overview: null,
    clinics:  clinics.length,
    beds:     beds.length,
    blood:    blood.length,
    medicines:medicines.length,
    staff:    doctors.length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <main id="main-content" style={{ flex: 1 }}>

        {/* ── Hero banner ──────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #082F49 0%, #0F766E 100%)', padding: '2.5rem 0 1.5rem' }}>
          <div className="page-container">
            <Link
              href="/hospitals"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginBottom: '1.25rem' }}
            >
              <ArrowLeft size={15} /> Hospital Directory
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                    {hospital.hospitalType}
                  </span>
                  <span className={hospital.verificationStatus === 'Verified' ? 'lc-badge lc-badge-success' : 'lc-badge lc-badge-warning'} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {hospital.verificationStatus === 'Verified' ? <CheckCircle size={11} /> : null}&nbsp;
                    {hospital.verificationStatus}
                  </span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '0.625rem' }}>
                  {hospital.officialName}
                </h1>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={15} /> {hospital.district}, {hospital.province}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {hospital.latitude && hospital.longitude && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${hospital.latitude}&mlon=${hospital.longitude}&zoom=16`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, color: 'white', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
                  >
                    <Navigation size={15} /> Directions
                  </a>
                )}
                <Link
                  href={`/citizen/appointments/new?hospital=${hospital.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: 'var(--teal)', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
                >
                  <Calendar size={15} /> Book Appointment
                </Link>
              </div>
            </div>

            {/* Quick info */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {[
                hospital.phoneNumbers?.[0] && { icon: <Phone size={13} />, label: hospital.phoneNumbers[0], href: `tel:${hospital.phoneNumbers[0]}` },
                hospital.email && { icon: <Mail size={13} />, label: hospital.email, href: `mailto:${hospital.email}` },
                hospital.website && { icon: <Globe size={13} />, label: 'Website', href: hospital.website },
              ].filter(Boolean).map((item: any) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}
                >
                  {item.icon} {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Service badges ────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
          <div className="page-container" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Services:</span>
            {[
              { available: hospital.emergencyAvailable,  label: 'Emergency',  color: '#DC2626' },
              { available: hospital.pharmacyAvailable,   label: 'Pharmacy',   color: '#0369A1' },
              { available: hospital.laboratoryAvailable, label: 'Laboratory', color: '#7C3AED' },
              { available: hospital.bloodBankAvailable,  label: 'Blood Bank', color: '#BE123C' },
            ].map(({ available, label, color }) => (
              <span
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: available === true ? color : 'var(--text-muted)',
                  opacity: available === null ? 0.5 : 1,
                }}
              >
                {available === true ? <CheckCircle size={13} color={color} /> : <AlertCircle size={13} color="var(--text-muted)" />}
                {label}
                {available === null && <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>(unknown)</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
          <div className="page-container">
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }} role="tablist">
              {(Object.keys(TAB_COUNTS) as (keyof typeof TAB_COUNTS)[]).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.875rem 1.125rem',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: `2.5px solid ${activeTab === tab ? 'var(--teal)' : 'transparent'}`,
                    color: activeTab === tab ? 'var(--teal)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textTransform: 'capitalize',
                    display: 'flex',
                    gap: '0.375rem',
                    alignItems: 'center',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                >
                  {tab === 'overview' ? 'Overview' :
                   tab === 'clinics'  ? 'Clinics' :
                   tab === 'beds'     ? 'Bed Status' :
                   tab === 'blood'    ? 'Blood' :
                   tab === 'medicines'? 'Medicines' :
                   tab === 'staff'    ? 'Medical Staff' : tab}
                  {TAB_COUNTS[tab] !== null && (
                    <span style={{
                      background: activeTab === tab ? 'var(--teal)' : 'var(--bg-muted)',
                      color: activeTab === tab ? 'white' : 'var(--text-muted)',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      minWidth: 20,
                      textAlign: 'center',
                    }}>{TAB_COUNTS[tab]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab content ──────────────────────────────────── */}
        <div style={{ padding: '2rem 0' }}>
          <div className="page-container">

            {/* Overview */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="tabpanel">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* About */}
                  <div className="lc-card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={18} color="var(--teal)" /> Hospital Information
                    </h2>
                    <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {[
                        { label: 'Type',     value: hospital.hospitalType },
                        { label: 'Province', value: hospital.province },
                        { label: 'District', value: hospital.district },
                        { label: 'Address',  value: hospital.address },
                        { label: 'Verified', value: <VerificationBadge status={hospital.verificationStatus} /> },
                      ].map(({ label, value }) => value && (
                        <div key={label} style={{ display: 'flex', gap: '0.75rem' }}>
                          <dt style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: 80, flexShrink: 0 }}>{label}:</dt>
                          <dd style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>{value as any}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Quick stats */}
                  <div className="lc-card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>At a Glance</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        { icon: <Stethoscope size={18} />, label: 'Clinics', count: clinics.length || '–', color: '#7C3AED' },
                        { icon: <Bed size={18} />,          label: 'Ward Types', count: beds.length || '–', color: '#0369A1' },
                        { icon: <Droplets size={18} />,     label: 'Blood Groups', count: blood.length ? `${blood.length}/8` : '–', color: '#DC2626' },
                        { icon: <Pill size={18} />,         label: 'Medicines', count: medicines.length ? `${medicines.length}+` : '–', color: '#D97706' },
                      ].map(({ icon, label, count, color }) => (
                        <div key={label} style={{ background: 'var(--bg-soft)', borderRadius: 12, padding: '0.875rem', textAlign: 'center' }}>
                          <div style={{ color, display: 'flex', justifyContent: 'center', marginBottom: '0.375rem' }}>{icon}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{count}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Clinics */}
            {activeTab === 'clinics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="tabpanel">
                {clinics.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Stethoscope size={36} style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600 }}>No clinic data available</p>
                    <p style={{ fontSize: '0.875rem' }}>Clinic schedules will appear here once they are entered by hospital staff.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {clinics.map((c) => (
                      <div key={c._id} className="lc-card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{c.name}</h3>
                          <span className={c.bookingOpen ? 'lc-badge lc-badge-success' : 'lc-badge lc-badge-neutral'}>
                            {c.bookingOpen ? 'Booking Open' : 'Booking Closed'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            <Clock size={13} style={{ flexShrink: 0 }} /> {c.day} · {c.startTime} – {c.endTime}
                          </div>
                          {c.capacity && (
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              Capacity: {c.capacity} patients
                            </div>
                          )}
                        </div>
                        {c.bookingOpen && (
                          <Link
                            href={`/citizen/appointments/new?hospital=${hospital.slug}&clinic=${c._id}`}
                            style={{ display: 'block', marginTop: '0.875rem', textAlign: 'center', padding: '0.5rem', background: 'var(--teal)', color: 'white', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}
                          >
                            Book This Clinic
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Beds */}
            {activeTab === 'beds' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="tabpanel">
                {beds.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Bed size={36} style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600 }}>No bed data available</p>
                    <p style={{ fontSize: '0.875rem' }}>Bed availability data will appear once entered by hospital staff.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {beds.map((b) => (
                      <div key={b.wardType} className="lc-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.625rem' }}>{b.wardType}</h3>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '0.25rem' }}>{b.available}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>of {b.total} beds available</div>
                        <span className={
                          b.publicStatus === 'Available' ? 'lc-badge lc-badge-success' :
                          b.publicStatus === 'Limited'   ? 'lc-badge lc-badge-warning' :
                          b.publicStatus === 'Full'      ? 'lc-badge lc-badge-danger' :
                          'lc-badge lc-badge-neutral'
                        }>
                          {b.publicStatus}
                        </span>
                        <div style={{ marginTop: '0.625rem' }}>
                          <DataFreshnessLabel level="recent" lastUpdated={b.lastUpdatedAt} compact />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Blood */}
            {activeTab === 'blood' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="tabpanel">
                {blood.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Droplets size={36} style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600 }}>No blood bank data available</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      {hospital.bloodBankAvailable === false
                        ? 'This hospital does not have a blood bank.'
                        : 'Blood availability data will appear once entered by hospital staff.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                      {blood.map((b) => (
                        <div key={b.bloodGroup} className="lc-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem' }}>{b.bloodGroup}</div>
                          <BloodStatusBadge status={b.status as any} />
                          <div style={{ marginTop: '0.5rem' }}>
                            <DataFreshnessLabel level="recent" lastUpdated={b.lastUpdatedAt} compact />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.25rem', textAlign: 'center' }}>
                      Blood availability is updated by blood bank staff. Levels shown are indicative.{' '}
                      <Link href="/blood" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Check all blood banks →</Link>
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Medicines */}
            {activeTab === 'medicines' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="tabpanel">
                {medicines.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Pill size={36} style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600 }}>No medicine data available</p>
                    <p style={{ fontSize: '0.875rem' }}>Medicine inventory will appear once entered by pharmacy staff.</p>
                    <Link href="/medicines" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', marginTop: '0.75rem', display: 'inline-block' }}>Search all medicines →</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {medicines.map((m, i) => (
                      <div key={i} className="lc-card" style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{m.medicineName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {[m.genericName, m.strength, m.form].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <AvailabilityBadge level={m.availability as any} />
                      </div>
                    ))}
                    <Link href="/medicines" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
                      Search All Medicines →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Staff */}
            {activeTab === 'staff' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="tabpanel">
                {doctors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Stethoscope size={36} style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600 }}>No staff directory available</p>
                    <p style={{ fontSize: '0.875rem', maxWidth: 400, margin: '0.5rem auto 0' }}>
                      Doctor details for this hospital are not yet available from official Ministry of Health sources.
                      Data is imported only from verified official records to prevent misinformation.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {doctors.map((d) => (
                      <div key={d._id} className="lc-card" style={{ padding: '1.25rem' }}>
                        {d.dataAvailable ? (
                          <>
                            <div style={{ fontWeight: 700 }}>{d.title ? `${d.title} ` : ''}{d.name || 'Name not available'}</div>
                            {d.specialty && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{d.specialty}</div>}
                          </>
                        ) : (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Doctor information awaiting official data from Ministry of Health.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
