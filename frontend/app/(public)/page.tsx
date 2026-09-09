'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2, Stethoscope, Pill, Map, Search, ChevronRight,
  Droplets, Clock, CheckCircle, Shield, Smartphone, Globe2,
  ArrowRight, MapPin, Heart, Phone, Activity, Users, TrendingUp,
  Zap, Star, AlertCircle
} from 'lucide-react';
import { CrowdBadge, DataFreshnessLabel, AvailabilityBadge } from '@/components/Badges';
import { Button } from '@/components/Button';

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
};

/* ─── Quick search bar ─────────────────────────────────────────────── */
function QuickSearchBar() {
  return (
    <motion.form
      variants={fadeUp}
      onSubmit={(e) => {
        e.preventDefault();
        const q = (e.currentTarget.querySelector('input') as HTMLInputElement).value;
        if (q) window.location.href = `/hospitals?search=${encodeURIComponent(q)}`;
      }}
      style={{
        display: 'flex',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        maxWidth: 560,
        width: '100%',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', color: 'var(--text-muted)' }}>
        <Search size={18} />
      </span>
      <input
        type="search"
        placeholder="Search hospitals, doctors, districts…"
        aria-label="Search LankaCare"
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          padding: '0.875rem 0.75rem',
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          background: 'var(--teal)',
          color: 'white',
          border: 'none',
          padding: '0 1.25rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          transition: 'background 0.15s',
        }}
      >
        Search <ChevronRight size={16} />
      </button>
    </motion.form>
  );
}

/* ─── Animated live hospital panel ──────────────────────────────────── */
function LiveHospitalPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '1.5rem',
        maxWidth: 320,
        width: '100%',
        boxShadow: '0 8px 32px rgba(3,105,161,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient accent */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,116,144,0.12) 0%, transparent 70%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            NEARBY HOSPITAL
          </p>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Base Hospital Kinniya
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
            Trincomalee District · Eastern Province
          </p>
        </div>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0369A1, #0D9488)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Building2 size={22} color="white" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {[
          { label: 'Medical OPD', value: <CrowdBadge level="moderate" />, icon: <Activity size={14} /> },
          { label: 'Appointments', value: <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#16A34A' }}>Available</span>, icon: <CheckCircle size={14} color="#16A34A" /> },
          { label: 'Medicine Stock', value: <AvailabilityBadge level="available" label="Recently Updated" />, icon: <Pill size={14} /> },
          { label: 'Distance', value: <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--teal)' }}>6.2 km</span>, icon: <MapPin size={14} /> },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              background: 'var(--bg-soft)',
              borderRadius: 10,
              gap: '0.5rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
              {icon} {label}
            </span>
            {value}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Link
          href="/hospitals/base-hospital-kinniya"
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.5rem',
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
        <Link
          href="/hospitals/map"
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.5rem',
            background: 'var(--bg-muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: '0.8125rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          View on Map
        </Link>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <DataFreshnessLabel level="recent" lastUpdated={new Date(Date.now() - 1000 * 60 * 17)} />
      </div>
    </motion.div>
  );
}

/* ─── National stats ─────────────────────────────────────────────── */
const STATS = [
  { value: '51+',  label: 'Government Hospitals',    icon: <Building2 size={22} /> },
  { value: '9',    label: 'Provinces Covered',        icon: <Globe2 size={22} /> },
  { value: '25',   label: 'Districts Served',         icon: <MapPin size={22} /> },
  { value: '24/7', label: 'Emergency Information',    icon: <Phone size={22} /> },
];

/* ─── Feature cards ──────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Building2 size={28} />,
    color: '#0369A1',
    bg: '#EFF6FF',
    title: 'Hospital Directory',
    desc: 'Browse verified government hospitals across all 25 districts. Search by name, location, or specialty.',
    href: '/hospitals',
    cta: 'Browse Hospitals',
  },
  {
    icon: <Map size={28} />,
    color: '#0D9488',
    bg: '#CCFBF1',
    title: 'Interactive Map',
    desc: 'Visualise all Sri Lankan hospitals on an interactive map. Filter by type, services, and proximity.',
    href: '/hospitals/map',
    cta: 'Open Map',
  },
  {
    icon: <Stethoscope size={28} />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Doctor Directory',
    desc: 'Find verified doctors by specialty, hospital, and clinic schedule. All data from official sources.',
    href: '/doctors',
    cta: 'Find Doctors',
  },
  {
    icon: <Pill size={28} />,
    color: '#B45309',
    bg: '#FFFBEB',
    title: 'Medicine Finder',
    desc: 'Check medicine availability at government hospitals. Find alternatives when stock is low.',
    href: '/medicines',
    cta: 'Find Medicines',
  },
  {
    icon: <Droplets size={28} />,
    color: '#DC2626',
    bg: '#FFF1F2',
    title: 'Blood Availability',
    desc: 'Track blood group availability across blood banks. Register as a donor and save lives.',
    href: '/blood',
    cta: 'Check Blood',
  },
  {
    icon: <Zap size={28} />,
    color: '#D97706',
    bg: '#FFFBEB',
    title: 'Smart Care Finder',
    desc: 'Get intelligent recommendations for the best hospital for your needs based on queue, distance, and service.',
    href: '/find-care',
    cta: 'Find Care Now',
  },
];

/* ─── How it works steps ──────────────────────────────────────────── */
const HOW_STEPS = [
  { step: '01', title: 'Find a Hospital', desc: 'Search by name, district, or use the interactive map to find government hospitals near you.' },
  { step: '02', title: 'Check Availability', desc: 'See real-time OPD crowd levels, bed availability, clinic schedules, and medicine stock.' },
  { step: '03', title: 'Book Appointment', desc: 'Create your account, book a clinic appointment, and receive a digital token with QR code.' },
  { step: '04', title: 'Track Your Queue', desc: 'Monitor your queue remotely. Get notified as you approach, so you can minimise waiting.' },
];

/* ─── Benefits ─────────────────────────────────────────────────────── */
const CITIZEN_BENEFITS = [
  { icon: <Clock size={20} />, title: 'Less Waiting', desc: 'Know crowd levels before you go and track your token remotely.' },
  { icon: <Shield size={20} />, title: 'Private & Secure', desc: 'Your health data is encrypted and never shared without consent.' },
  { icon: <Smartphone size={20} />, title: 'Works on Any Device', desc: 'Fully responsive. Install as a PWA for offline access.' },
  { icon: <Globe2 size={20} />, title: 'Three Languages', desc: 'Available in English, සිංහල, and தமிழ். Accessible to all citizens.' },
  { icon: <Heart size={20} />, title: 'Health Wallet', desc: 'Keep all your appointments, prescriptions and lab results in one secure place.' },
  { icon: <Star size={20} />, title: 'Verified Data', desc: 'All hospital and doctor information from official Ministry of Health sources.' },
];

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '50%',
            height: '120%',
            background: 'radial-gradient(ellipse at 60% 40%, rgba(14,116,144,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '40%',
            height: '80%',
            background: 'radial-gradient(ellipse at 40% 60%, rgba(3,105,161,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="page-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left — headline */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ maxWidth: 560 }}
            >
              <motion.span
                variants={fadeUp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'var(--teal-soft)',
                  color: 'var(--teal)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '0.3125rem 0.875rem',
                  borderRadius: '999px',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(13,148,136,0.2)',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', animation: 'pulse-green 2s infinite' }} />
                Sri Lanka National Digital Health Platform
              </motion.span>

              <motion.h1
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  marginBottom: '1.25rem',
                }}
              >
                Better Healthcare.
                <br />
                <span style={{ color: 'var(--teal)' }}>Less Waiting.</span>
                <br />
                One Connected{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #0369A1, #0D9488)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Sri Lanka.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                  maxWidth: 480,
                }}
              >
                Find verified government hospitals, discover healthcare services, check clinic availability,
                manage appointments and reduce unnecessary waiting through one secure national platform.
              </motion.p>

              <QuickSearchBar />

              <motion.div
                variants={fadeUp}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                {[
                  { label: 'Find Hospital', href: '/hospitals', primary: true },
                  { label: 'Book Appointment', href: '/citizen/appointments/new', primary: false },
                  { label: 'Check Medicine', href: '/medicines', primary: false },
                  { label: 'Hospital Map', href: '/hospitals/map', primary: false },
                ].map(({ label, href, primary }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: '0.5625rem 1.125rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: primary ? 600 : 500,
                      color: primary ? 'white' : 'var(--text-primary)',
                      background: primary ? 'var(--teal)' : 'var(--bg-card)',
                      border: `1.5px solid ${primary ? 'transparent' : 'var(--border)'}`,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                    {primary && <ArrowRight size={15} />}
                  </Link>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — live hospital panel */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LiveHospitalPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 0', background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {STATS.map(({ value, label, icon }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  background: 'var(--bg-card)',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ color: 'var(--teal)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
                Everything You Need, In One Place
              </h2>
              <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
                LankaCare connects Sri Lankan citizens with their healthcare system through a modern,
                secure digital platform.
              </p>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {FEATURES.map(({ icon, color, bg, title, desc, href, cta }) => (
                <motion.div key={title} variants={fadeUp}>
                  <Link
                    href={href}
                    style={{
                      display: 'block',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 18,
                      padding: '1.5rem',
                      textDecoration: 'none',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color,
                        marginBottom: '1rem',
                      }}
                    >
                      {icon}
                    </div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{desc}</p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color }}>
                      {cta} <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-soft)' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
                How LankaCare Works
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
                From finding a hospital to tracking your queue — everything in four simple steps.
              </p>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {HOW_STEPS.map(({ step, title, desc }, i) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  style={{
                    position: 'relative',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: '1.75rem 1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: 'var(--teal)',
                      opacity: 0.15,
                      position: 'absolute',
                      top: '1rem',
                      right: '1.25rem',
                      lineHeight: 1,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {step}
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0369A1, #0D9488)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DIGITAL QUEUE PREVIEW ─────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <motion.div variants={fadeUp}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
                Track Your Queue From Anywhere
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                No more sitting in crowded waiting rooms. Our digital queue lets you monitor your token
                status in real-time and arrive just in time.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  'See how many patients are ahead',
                  'Get push notifications as you approach',
                  'Leave and come back just in time',
                  'View estimated wait times',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={16} color="#16A34A" style={{ flexShrink: 0 }} /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/citizen/queue" className="lc-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', borderRadius: 10 }}>
                View Queue Demo <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #082F49, #0F766E)',
                  borderRadius: 22,
                  padding: '2rem',
                  color: 'white',
                  maxWidth: 320,
                  margin: '0 auto',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.5rem' }}>
                  Base Hospital Kinniya · Medical OPD
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>NOW SERVING</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#5EEAD4' }}>A042</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>YOUR TOKEN</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'white' }}>A056</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.25rem' }}>AHEAD OF YOU</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>14</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.25rem' }}>EST. WAIT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>31 min</div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '1.25rem',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>Crowd Level</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FCD34D' }}>🟡 Moderate</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SMART CARE FINDER ────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-soft)' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="lc-badge lc-badge-teal" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
                <Zap size={12} /> Smart Feature
              </span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
                Smart Care Finder
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                Not sure which hospital is best right now? Let LankaCare analyse distance, queues, service
                availability and recommend the optimal facility for non-emergency needs.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                maxWidth: 900,
                margin: '0 auto',
              }}
            >
              {[
                {
                  label: 'RECOMMENDED',
                  hospital: 'Base Hospital Kinniya',
                  distance: '6.2 km',
                  clinic: 'Medical Clinic',
                  clinicStatus: 'Available',
                  wait: '22 min',
                  crowd: 'low' as const,
                  recommended: true,
                },
                {
                  label: 'ALTERNATIVE',
                  hospital: 'District General Hospital Trincomalee',
                  distance: '12.5 km',
                  clinic: 'Medical Clinic',
                  clinicStatus: 'Available',
                  wait: '45 min',
                  crowd: 'moderate' as const,
                  recommended: false,
                },
              ].map((opt) => (
                <div
                  key={opt.hospital}
                  style={{
                    background: 'var(--bg-card)',
                    border: `2px solid ${opt.recommended ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 18,
                    padding: '1.5rem',
                    position: 'relative',
                  }}
                >
                  {opt.recommended && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--teal)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '0.2rem 0.75rem',
                        borderRadius: '999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.label}
                    </span>
                  )}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    {opt.hospital}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Distance</span>
                      <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{opt.distance}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Clinic</span>
                      <span style={{ fontWeight: 500 }}>{opt.clinicStatus}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Est. Wait</span>
                      <span style={{ fontWeight: 600 }}>{opt.wait}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Crowd</span>
                      <CrowdBadge level={opt.crowd} />
                    </div>
                  </div>
                  <Link
                    href="/find-care"
                    style={{
                      display: 'block',
                      marginTop: '1rem',
                      textAlign: 'center',
                      padding: '0.5rem',
                      background: opt.recommended ? 'var(--teal)' : 'var(--bg-muted)',
                      color: opt.recommended ? 'white' : 'var(--text-primary)',
                      borderRadius: 10,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {opt.recommended ? 'Book Here' : 'View Details'}
                  </Link>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/find-care" className="lc-btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none', gap: '0.375rem', borderRadius: 10 }}>
                Try Smart Care Finder <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CITIZEN BENEFITS ─────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
                Built for Every Sri Lankan
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                From a citizen in Jaffna to a patient in Kinniya — LankaCare works for everyone.
              </p>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              {CITIZEN_BENEFITS.map(({ icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'var(--teal-soft)',
                      color: 'var(--teal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BLOOD & MEDICINE PREVIEW ──────────────────────────── */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-soft)' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Blood availability */}
            <motion.div variants={fadeUp} className="lc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>Blood Availability</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Eastern Province · Trincomalee</p>
                </div>
                <Droplets size={22} color="#DC2626" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { group: 'O+', status: 'Adequate', color: '#16A34A' },
                  { group: 'A+', status: 'Moderate', color: '#0284C7' },
                  { group: 'B+', status: 'Low',      color: '#D97706' },
                  { group: 'AB+',status: 'Critical', color: '#DC2626' },
                ].map(({ group, status, color }) => (
                  <div
                    key={group}
                    style={{
                      padding: '0.625rem',
                      background: 'var(--bg-soft)',
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{group}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{status}</span>
                  </div>
                ))}
              </div>
              <Link href="/blood" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}>
                View all blood data <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Medicine finder */}
            <motion.div variants={fadeUp} className="lc-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>Medicine Finder</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Find availability across government hospitals</p>
                </div>
                <Pill size={22} color="#B45309" />
              </div>
              {[
                { name: 'Metformin 500mg', hospital: 'Base Hospital Kinniya',          avail: 'available' as const },
                { name: 'Amlodipine 5mg', hospital: 'DGH Trincomalee',                 avail: 'limited' as const },
                { name: 'Omeprazole 20mg',hospital: 'Base Hospital Kantale',           avail: 'available' as const },
              ].map(({ name, hospital, avail }) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.625rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hospital}</div>
                  </div>
                  <AvailabilityBadge level={avail} />
                </div>
              ))}
              <Link href="/medicines" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}>
                Search all medicines <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Emergency */}
            <motion.div variants={fadeUp} className="lc-card" style={{ padding: '1.5rem', borderColor: '#DC262620' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertCircle size={22} color="#DC2626" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Emergency</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Find emergency units and verified contact information</p>
                </div>
              </div>
              <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#991B1B', marginBottom: '0.25rem' }}>National Emergency Hotline</div>
                <a href="tel:1990" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626', textDecoration: 'none', letterSpacing: '-0.03em' }}>1990</a>
              </div>
              <Link href="/emergency" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: '#DC2626', textDecoration: 'none' }}>
                View emergency information <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PRIVACY & SECURITY ────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <motion.div variants={fadeUp}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
                Your Privacy Is Our Priority
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                LankaCare is built with healthcare-grade security. Your health data belongs to you — never sold,
                never shared without your consent.
              </p>
              {[
                { title: 'End-to-End Encryption', desc: 'Your NIC and health records are encrypted using industry-standard cryptography.' },
                { title: 'HTTP-only Secure Cookies', desc: 'Sessions are secured against XSS and theft. Tokens rotate automatically.' },
                { title: 'Role-Based Access Control', desc: 'Staff can only see information relevant to their role. Full audit logging.' },
                { title: 'WCAG 2.2 Accessible', desc: 'Full keyboard navigation, screen reader support, and accessible forms.' },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <Shield size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <Link href="/privacy" className="lc-btn-secondary" style={{ textDecoration: 'none', borderRadius: 10, display: 'inline-flex', fontSize: '0.875rem' }}>Privacy Policy</Link>
                <Link href="/security" className="lc-btn-secondary" style={{ textDecoration: 'none', borderRadius: 10, display: 'inline-flex', fontSize: '0.875rem' }}>Security</Link>
              </div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                {[
                  { icon: <Shield size={24} />, label: 'Encrypted NIC', color: '#0369A1' },
                  { icon: <CheckCircle size={24} />, label: 'Verified Data', color: '#16A34A' },
                  { icon: <Users size={24} />, label: 'Role-Based Access', color: '#7C3AED' },
                  { icon: <TrendingUp size={24} />, label: 'Audit Logged', color: '#D97706' },
                ].map(({ icon, label, color }) => (
                  <div
                    key={label}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color, marginBottom: '0.625rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #082F49 0%, #0F766E 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
              Ready to Transform Your Healthcare Experience?
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Create your free LankaCare account and take control of your health journey today.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/register"
                style={{
                  padding: '0.875rem 2rem',
                  background: 'white',
                  color: '#082F49',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link
                href="/hospitals"
                style={{
                  padding: '0.875rem 2rem',
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                Browse Hospitals
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ PREVIEW ──────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Quick answers to common questions. <Link href="/faq" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>View all FAQs</Link>
              </p>
            </motion.div>

            <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  q: 'Is LankaCare free to use?',
                  a: 'Yes. LankaCare is completely free for all Sri Lankan citizens. There are no charges for searching hospitals, finding doctors, or booking appointments.',
                },
                {
                  q: 'Is my health data safe?',
                  a: 'Absolutely. Your NIC is encrypted and never displayed publicly. Your health records are protected by strict role-based access and audit logging.',
                },
                {
                  q: 'Does LankaCare cover all government hospitals?',
                  a: 'LankaCare includes all major government hospitals across all 9 provinces and 25 districts. Data is sourced from the Ministry of Health Sri Lanka.',
                },
                {
                  q: 'Can I use LankaCare in Sinhala or Tamil?',
                  a: 'Yes. LankaCare supports English, සිංහල (Sinhala), and தமிழ் (Tamil) across all pages.',
                },
              ].map(({ q, a }) => (
                <motion.details
                  key={q}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      padding: '1rem 1.25rem',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      cursor: 'pointer',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {q}
                    <ChevronRight size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                  </summary>
                  <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {a}
                  </div>
                </motion.details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
