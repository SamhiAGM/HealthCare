'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserCheck, Bed, LogOut, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WardsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState<{ id: string, name: string } | null>(null);
  
  const [formData, setFormData] = useState({ 
    citizenId: '', doctorId: '', departmentId: '', wardId: '', diagnosis: '', notes: ''
  });
  
  const [dischargeData, setDischargeData] = useState({ status: 'Discharged', notes: '' });

  const { data: wards = [] } = useQuery({
    queryKey: ['admin-beds'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/beds`, { credentials: 'include' });
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

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['admin-admissions'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/admissions?status=Admitted`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch admissions');
      const data = await res.json();
      return data.data;
    }
  });

  const admitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to admit patient');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Patient admitted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-beds'] });
      setIsAdmitModalOpen(false);
      setFormData({ citizenId: '', doctorId: '', departmentId: '', wardId: '', diagnosis: '', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const dischargeMutation = useMutation({
    mutationFn: async (payload: { id: string, status: string, notes: string }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/admissions/${payload.id}/discharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: payload.status, notes: payload.notes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to discharge patient');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Patient discharged successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-beds'] });
      setIsDischargeModalOpen(null);
      setDischargeData({ status: 'Discharged', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    admitMutation.mutate(formData);
  };

  const handleDischargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDischargeModalOpen) return;
    dischargeMutation.mutate({ id: isDischargeModalOpen.id, ...dischargeData });
  };

  const filtered = admissions.filter((a: any) => 
    a.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.citizenId?.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.wardId?.wardType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Patient Admissions</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage hospital wards, patient admissions, and discharges.</p>
        </div>
        <button 
          onClick={() => setIsAdmitModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={18} /> Admit Patient
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const totalAdmitted = admissions.length;
          const today = new Date().toISOString().split('T')[0];
          const admittedToday = admissions.filter((a: any) => a.admissionDate.startsWith(today)).length;
          
          return (
            <>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Currently Admitted</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalAdmitted}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Admitted Today</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>{admittedToday}</div>
              </div>
            </>
          );
        })()}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search patient name or NIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading admissions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active admissions found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ward</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Doctor</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Admission Date</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.citizenId?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>NIC: {item.citizenId?.nic}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--teal)' }}>
                      <Bed size={16} />
                      {item.wardId?.wardType || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {item.doctorId ? `${item.doctorId.title} ${item.doctorId.name}` : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {new Date(item.admissionDate).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => setIsDischargeModalOpen({ id: item._id, name: item.citizenId?.name })}
                      style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      <LogOut size={16} /> Discharge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Admit Modal */}
      {isAdmitModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UserCheck size={24} color="var(--teal)" /> Admit Patient
            </h2>
            <form onSubmit={handleAdmitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Citizen ID (Object ID) *</label>
                <input 
                  type="text" required 
                  placeholder="Paste Citizen ObjectId here"
                  value={formData.citizenId} onChange={(e) => setFormData({...formData, citizenId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Note: In a real flow, you would search for a patient by NIC here.</div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Ward *</label>
                  <select 
                    required 
                    value={formData.wardId} onChange={(e) => setFormData({...formData, wardId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select Ward</option>
                    {wards.map((w: any) => (
                      <option key={w._id} value={w._id} disabled={w.available <= 0}>
                        {w.wardType} - {w.available} beds available
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Attending Doctor</label>
                  <select 
                    value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="">None</option>
                    {doctors.map((d: any) => (
                      <option key={d._id} value={d._id}>{d.title} {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Diagnosis</label>
                <input 
                  type="text" 
                  value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Admission Notes</label>
                <textarea 
                  rows={3}
                  value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsAdmitModalOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={admitMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: admitMutation.isPending ? 0.7 : 1 }}>
                  {admitMutation.isPending ? 'Admitting...' : 'Admit Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Modal */}
      {isDischargeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ArrowRightCircle size={24} color="#991B1B" /> Discharge Patient
            </h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              You are discharging <strong>{isDischargeModalOpen.name}</strong>. Their bed will be freed.
            </p>

            <form onSubmit={handleDischargeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Discharge Status *</label>
                <select 
                  required 
                  value={dischargeData.status} onChange={(e) => setDischargeData({...dischargeData, status: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  <option value="Discharged">Regular Discharge</option>
                  <option value="Transferred">Transferred to another hospital</option>
                  <option value="Deceased">Deceased</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Discharge Notes / Instructions</label>
                <textarea 
                  rows={4} required
                  placeholder="Medications to take, follow-up instructions..."
                  value={dischargeData.notes} onChange={(e) => setDischargeData({...dischargeData, notes: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsDischargeModalOpen(null)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={dischargeMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: dischargeMutation.isPending ? 0.7 : 1 }}>
                  {dischargeMutation.isPending ? 'Processing...' : 'Confirm Discharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
