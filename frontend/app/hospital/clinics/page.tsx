'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function HospitalClinicsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const clinics = [
    { id: '1', name: 'Cardiology Clinic', day: 'Monday', time: '08:00 - 12:00', room: 'Room 4', capacity: 60, status: 'Active' },
    { id: '2', name: 'ENT Clinic', day: 'Tuesday', time: '13:00 - 16:00', room: 'Room 2', capacity: 40, status: 'Active' },
    { id: '3', name: 'Eye Clinic', day: 'Wednesday', time: '08:00 - 12:00', room: 'Room 12', capacity: 85, status: 'Active' },
    { id: '4', name: 'Neurology Clinic', day: 'Thursday', time: '09:00 - 13:00', room: 'Room 5', capacity: 30, status: 'Inactive' },
  ];

  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'info'}>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} color="var(--teal)" /> Clinic Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage hospital clinic schedules, capacities, and operations.</p>
        </div>
        <Button variant="primary" onClick={() => showToast("Add New Clinic form will open here.", 'info')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add New Clinic
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            placeholder="Search clinics..."
            className="lc-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <select className="lc-input" style={{ width: 'auto' }}>
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select className="lc-input" style={{ width: 'auto' }}>
          <option>All Days</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
        </select>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Clinic Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Schedule</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Location</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Capacity</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic, i) => (
                <tr key={clinic.id} style={{ borderBottom: i === clinics.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{clinic.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} /> {clinic.day} ({clinic.time})
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{clinic.room}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{clinic.capacity}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 999, background: clinic.status === 'Active' ? '#ECFDF5' : '#F3F4F6', color: clinic.status === 'Active' ? '#059669' : '#4B5563' }}>
                      {clinic.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => showToast(`Editing ${clinic.name}`, 'info')} style={{ padding: '0.375rem', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--teal)', cursor: 'pointer' }} aria-label="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => showToast(`Deleting ${clinic.name}`, 'info')} style={{ padding: '0.375rem', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: '#DC2626', cursor: 'pointer' }} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div style={{ 
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
            background: toast.type === 'success' ? '#059669' : '#1F2937', color: 'white',
            padding: '1rem 1.5rem', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
