'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Calendar, Clock, Users, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClinicsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<{ id: string, name: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', day: 'Monday', startTime: '08:00', endTime: '12:00',
    capacity: 50, bookingOpen: true, departmentId: '', doctorId: ''
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/hospital-admin/departments`, { credentials: 'include' });
      const data = await res.json();
      return data.data || [];
    }
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/doctors`, { credentials: 'include' });
      const data = await res.json();
      return data.data || [];
    }
  });

  const { data: clinics = [], isLoading } = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/clinics`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch clinics');
      const data = await res.json();
      return data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/clinics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create clinic');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Clinic created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
      setIsModalOpen(false);
      setFormData({ name: '', day: 'Monday', startTime: '08:00', endTime: '12:00', capacity: 50, bookingOpen: true, departmentId: '', doctorId: '' });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (payload: { id: string, reason: string }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/clinics/${payload.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: payload.reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to cancel clinic');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Clinic cancelled. ${data.affectedAppointments} appointments cancelled.`);
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
      setCancelModalOpen(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOpen) return;
    cancelMutation.mutate({ id: cancelModalOpen.id, reason: cancelReason });
  };

  const filtered = clinics.filter((c: any) => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Clinics</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage hospital clinic schedules and bookings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={18} /> New Clinic Schedule
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading clinics...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No clinics found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Clinic Info</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Schedule</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Capacity</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)', opacity: c.status === 'Cancelled' ? 0.6 : 1 }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    {c.doctorId && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.doctorId.title} {c.doctorId.name}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      <Calendar size={14} color="var(--teal)" /> {c.day}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <Clock size={14} /> {c.startTime} - {c.endTime}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Users size={16} /> {c.capacity || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {c.status === 'Active' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem' }}>Active</span>}
                    {c.status === 'Cancelled' && <span style={{ color: '#991B1B', background: '#FEE2E2', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem' }}>Cancelled</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {c.status === 'Active' && (
                      <button 
                        onClick={() => setCancelModalOpen({ id: c._id, name: c.name })}
                        style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.75rem' }}
                      >
                        <Trash2 size={14} /> Cancel Clinic
                      </button>
                    )}
                    {c.status === 'Cancelled' && c.cancellationReason && (
                      <div style={{ fontSize: '0.75rem', color: '#991B1B', maxWidth: '150px' }}>Reason: {c.cancellationReason}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>New Clinic Schedule</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Clinic Name *</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Morning OPD, General Medicine Clinic"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Day of Week *</label>
                  <select 
                    value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Capacity</label>
                  <input 
                    type="number" min={1} required 
                    value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Start Time (HH:MM) *</label>
                  <input 
                    type="time" required 
                    value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>End Time (HH:MM) *</label>
                  <input 
                    type="time" required 
                    value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Department</label>
                  <select 
                    value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="">None</option>
                    {departments.map((dep: any) => (
                      <option key={dep._id} value={dep._id}>{dep.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Doctor</label>
                  <select 
                    value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select Doctor (Optional)</option>
                    {doctors.map((doc: any) => (
                      <option key={doc._id} value={doc._id}>{doc.title} {doc.name} - {doc.specialty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="bookingOpen"
                  checked={formData.bookingOpen} 
                  onChange={(e) => setFormData({...formData, bookingOpen: e.target.checked})}
                />
                <label htmlFor="bookingOpen" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Enable patient bookings</label>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: createMutation.isPending ? 0.7 : 1 }}>
                  {createMutation.isPending ? 'Saving...' : 'Create Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Clinic Modal */}
      {cancelModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#991B1B' }}>
              <AlertCircle size={32} />
              <h2 style={{ margin: 0 }}>Cancel Clinic</h2>
            </div>
            
            <p style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to cancel the clinic <strong>{cancelModalOpen.name}</strong>? 
              This action will automatically cancel all associated upcoming appointments and notify patients via SMS.
            </p>

            <form onSubmit={handleCancelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Reason for Cancellation (Required for SMS) *</label>
                <input 
                  type="text" required minLength={5}
                  placeholder="e.g. Doctor on emergency leave"
                  value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #FCA5A5', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCancelModalOpen(null)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Abort
                </button>
                <button type="submit" disabled={cancelMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: cancelMutation.isPending ? 0.7 : 1 }}>
                  {cancelMutation.isPending ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
