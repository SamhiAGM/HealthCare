'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Activity, Edit2, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BloodBankPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    bloodGroup: 'O+', 
    units: 0 
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['admin-blood'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/blood`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch blood inventory');
      const data = await res.json();
      return data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/blood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update blood stock');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Blood stock updated');
      queryClient.invalidateQueries({ queryKey: ['admin-blood'] });
      setIsModalOpen(false);
      setFormData({ bloodGroup: 'O+', units: 0 });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleEdit = (item: any) => {
    setFormData({
      bloodGroup: item.bloodGroup,
      units: item.units
    });
    setIsModalOpen(true);
  };

  const filtered = inventory.filter((b: any) => 
    b.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Blood Bank</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage hospital blood inventory and track shortages.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ bloodGroup: 'O+', units: 0 });
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={18} /> Update Stock
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const totalUnits = inventory.reduce((acc: number, curr: any) => acc + curr.units, 0);
          const criticalGroups = inventory.filter((i: any) => i.status === 'critical').length;
          const lowGroups = inventory.filter((i: any) => i.status === 'low').length;
          
          return (
            <>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Units</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalUnits}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Critical Groups</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#991B1B' }}>{criticalGroups}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Low Stock</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9A3412' }}>{lowGroups}</div>
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
            placeholder="Search blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No blood inventory data available.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Blood Group</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Units Available</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Updated</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#DC2626', fontSize: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Activity size={20} />
                      {item.bloodGroup}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>{item.units} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>units</span></td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'adequate' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={12} /> Adequate</span>}
                    {item.status === 'moderate' && <span style={{ color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><TrendingDown size={12} /> Moderate</span>}
                    {item.status === 'low' && <span style={{ color: '#9A3412', background: '#FFEDD5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><AlertTriangle size={12} /> Low Stock</span>}
                    {item.status === 'critical' && <span style={{ color: '#991B1B', background: '#FEE2E2', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><AlertTriangle size={12} /> Critical (Empty)</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(item.lastUpdatedAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
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
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={24} color="#DC2626" /> Update Blood Stock
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Blood Group *</label>
                <select 
                  required 
                  value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Units Available *</label>
                <input 
                  type="number" required min={0}
                  value={formData.units} onChange={(e) => setFormData({...formData, units: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={updateMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: updateMutation.isPending ? 0.7 : 1 }}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
