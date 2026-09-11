'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Bed, Edit2, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BedsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    wardType: 'General', 
    total: 0, 
    occupied: 0 
  });

  const { data: beds = [], isLoading } = useQuery({
    queryKey: ['admin-beds'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/beds`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch bed inventory');
      const data = await res.json();
      return data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/beds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update beds');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Bed inventory updated');
      queryClient.invalidateQueries({ queryKey: ['admin-beds'] });
      setIsModalOpen(false);
      setFormData({ wardType: 'General', total: 0, occupied: 0 });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.occupied > formData.total) {
      return toast.error('Occupied beds cannot exceed total beds');
    }
    updateMutation.mutate(formData);
  };

  const handleEdit = (ward: any) => {
    setFormData({
      wardType: ward.wardType,
      total: ward.total,
      occupied: ward.occupied
    });
    setIsModalOpen(true);
  };

  const filtered = beds.filter((b: any) => 
    b.wardType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const wardTypes = ['General', 'ICU', 'Maternity', 'Pediatric', 'Emergency', 'Isolation', 'Surgical', 'Medical'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Bed Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage hospital bed capacity and live occupancy across wards.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ wardType: 'General', total: 0, occupied: 0 });
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={18} /> Update Ward
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const total = beds.reduce((acc: number, curr: any) => acc + curr.total, 0);
          const occupied = beds.reduce((acc: number, curr: any) => acc + curr.occupied, 0);
          const available = total - occupied;
          const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
          return (
            <>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Beds</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Occupied</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9A3412' }}>{occupied}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Available</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>{available}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Occupancy Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: rate > 90 ? '#991B1B' : 'var(--text-primary)' }}>{rate}%</div>
              </div>
            </>
          );
        })()}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading bed inventory...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No wards configured.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ward Type</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Beds</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Occupied</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Available</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ward: any) => (
                <tr key={ward._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bed size={18} color="var(--teal)" />
                      {ward.wardType}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{ward.total}</td>
                  <td style={{ padding: '1rem', color: '#9A3412', fontWeight: 600 }}>{ward.occupied}</td>
                  <td style={{ padding: '1rem', color: '#166534', fontWeight: 600 }}>{ward.available}</td>
                  <td style={{ padding: '1rem' }}>
                    {ward.publicStatus === 'Available' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={12} /> Available</span>}
                    {ward.publicStatus === 'Limited' && <span style={{ color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><TrendingDown size={12} /> Limited</span>}
                    {ward.publicStatus === 'Critical' && <span style={{ color: '#9A3412', background: '#FFEDD5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><AlertTriangle size={12} /> Critical</span>}
                    {ward.publicStatus === 'Full' && <span style={{ color: '#991B1B', background: '#FEE2E2', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><XCircle size={12} /> Full</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleEdit(ward)} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Edit2 size={16} /> Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Update Ward Inventory</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Ward Type *</label>
                <select 
                  required 
                  value={formData.wardType} onChange={(e) => setFormData({...formData, wardType: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  {wardTypes.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Beds *</label>
                <input 
                  type="number" required min={1}
                  value={formData.total} onChange={(e) => setFormData({...formData, total: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Occupied Beds *</label>
                <input 
                  type="number" required min={0}
                  value={formData.occupied} onChange={(e) => setFormData({...formData, occupied: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={updateMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: updateMutation.isPending ? 0.7 : 1 }}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
