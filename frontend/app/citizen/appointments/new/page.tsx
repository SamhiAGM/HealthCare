'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, MapPin, Building2,
  ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Search
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';

interface Hospital { _id: string; officialName: string; district: string; province: string; slug: string }
interface Clinic { _id: string; name: string; day: string; startTime: string; endTime: string; capacity: number }

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedHospital = searchParams.get('hospital');
  const preselectedClinic = searchParams.get('clinic');

  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [successId, setSuccessId] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch Hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/v1/hospitals?limit=50&sort=name`);
        if (res.ok) {
          const json = await res.json();
          setHospitals(json.hospitals || []);
          if (preselectedHospital) {
            const found = json.hospitals.find((h: any) => h.slug === preselectedHospital);
            if (found) {
              setSelectedHospital(found);
              setStep(2);
            }
          }
        }
      } catch {
        setError('Failed to load hospitals.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, [API, preselectedHospital]);

  // Fetch Clinics when Hospital selected
  useEffect(() => {
    if (!selectedHospital) return;
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/v1/hospitals/${selectedHospital.slug}`);
        if (res.ok) {
          const json = await res.json();
          setClinics(json.clinics || []);
          if (preselectedClinic) {
            const found = json.clinics.find((c: any) => c._id === preselectedClinic);
            if (found) {
              setSelectedClinic(found);
              setStep(3);
            }
          }
        }
      } catch {
        setError('Failed to load clinics.');
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, [selectedHospital, API, preselectedClinic]);

  const generateDates = (dayOfWeek: string) => {
    // Helper to generate the next 4 available dates matching the clinic's day of week
    const daysMap: Record<string, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = daysMap[dayOfWeek];
    if (targetDay === undefined) return [];

    const dates = [];
    let d = new Date();
    d.setHours(0,0,0,0);
    // Find next matching day
    while (d.getDay() !== targetDay) {
      d.setDate(d.getDate() + 1);
    }
    // Add 4 consecutive weeks
    for (let i = 0; i < 4; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    return dates;
  };

  const handleBook = async () => {
    if (!selectedHospital || !selectedClinic || !selectedDate) return;
    setBooking(true);
    setError('');
    try {
      // Endpoint to be created in phase 7
      const res = await fetch(`${API}/api/v1/citizen/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hospitalId: selectedHospital._id,
          clinicId: selectedClinic._id,
          appointmentDate: selectedDate,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessId(json.appointment._id);
        setStep(5);
      } else {
        setError(json.error || 'Failed to book appointment');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.officialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? 'var(--teal)' : 'var(--border)', transition: 'background 0.3s' }} />
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link href="/citizen/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontWeight: 600 }}>Book Appointment</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '2rem' }}>
        {step < 5 && renderStepIndicator()}

        <AnimatePresence mode="wait">
          {/* STEP 1: Select Hospital */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select Hospital</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Choose the hospital you wish to visit.</p>
              
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="search"
                  className="lc-input"
                  placeholder="Search hospital name or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 400, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={70} borderRadius={10} />) : 
                 filteredHospitals.map(h => (
                  <button
                    key={h._id}
                    onClick={() => { setSelectedHospital(h); setStep(2); }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem',
                      background: selectedHospital?._id === h._id ? 'var(--teal-soft)' : 'var(--bg-soft)',
                      border: `1.5px solid ${selectedHospital?._id === h._id ? 'var(--teal)' : 'transparent'}`,
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{h.officialName}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {h.district}, {h.province}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Select Clinic */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <ChevronLeft size={16} /> Back
              </button>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select Clinic</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Available clinics at {selectedHospital?.officialName}</p>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} borderRadius={10} />)}
                </div>
              ) : clinics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-soft)', borderRadius: 12 }}>
                  <p style={{ color: 'var(--text-muted)' }}>No clinics available at this hospital currently.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {clinics.map(c => (
                    <button
                      key={c._id}
                      onClick={() => { setSelectedClinic(c); setStep(3); }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem',
                        background: 'var(--bg-soft)', border: '1.5px solid transparent', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <CalendarIcon size={12} /> {c.day}s <Clock size={12} style={{ marginLeft: 4 }} /> {c.startTime} - {c.endTime}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Select Date */}
          {step === 3 && selectedClinic && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <ChevronLeft size={16} /> Back
              </button>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select Date</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{selectedClinic.name} runs on {selectedClinic.day}s.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {generateDates(selectedClinic.day).map((date, i) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <button
                      key={dateStr}
                      onClick={() => { setSelectedDate(dateStr); setStep(4); }}
                      style={{
                        padding: '1rem', background: selectedDate === dateStr ? 'var(--teal-soft)' : 'var(--bg-soft)',
                        border: `1.5px solid ${selectedDate === dateStr ? 'var(--teal)' : 'transparent'}`,
                        borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)',
                        display: 'flex', justifyContent: 'space-between'
                      }}
                    >
                      <span>{date.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {i === 0 && <span style={{ fontSize: '0.75rem', background: 'var(--teal)', color: 'white', padding: '0.125rem 0.5rem', borderRadius: 999 }}>Next Available</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Confirm */}
          {step === 4 && selectedHospital && selectedClinic && selectedDate && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <ChevronLeft size={16} /> Back
              </button>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Confirm Booking</h1>

              {error && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} color="#DC2626" />
                  <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{error}</span>
                </div>
              )}

              <div style={{ background: 'var(--bg-soft)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <dl style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <dt style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Hospital</dt>
                    <dd style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Building2 size={16} color="var(--teal)" /> {selectedHospital.officialName}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Clinic</dt>
                    <dd style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedClinic.name}</dd>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date</dt>
                      <dd style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <CalendarIcon size={16} /> {new Date(selectedDate).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Time</dt>
                      <dd style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={16} /> {selectedClinic.startTime}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <Button variant="primary" fullWidth size="lg" loading={booking} onClick={handleBook}>
                Confirm Booking
              </Button>
            </motion.div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={32} color="#16A34A" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Your appointment at {selectedHospital?.officialName} has been scheduled.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/citizen/dashboard" style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-soft)', color: 'var(--text-primary)', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>
                  Go to Dashboard
                </Link>
                <Link href={`/citizen/appointments/${successId}`} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', color: 'white', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>
                  View e-Ticket
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
