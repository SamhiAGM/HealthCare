'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pill, Edit2, TrendingDown, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PharmacyPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    brandName: '', 
    genericName: '',
    batchNumber: '',
    expiryDate: '',
    stockLevel: 0 
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['admin-pharmacy'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/medicines`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch medicine inventory');
      const data = await res.json();
      return data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update medicine stock');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Medicine stock updated');
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacy'] });
      setIsModalOpen(false);
      setFormData({ brandName: '', genericName: '', batchNumber: '', expiryDate: '', stockLevel: 0 });
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
      brandName: item.medicineName,
      genericName: item.genericName || '',
      batchNumber: item.notes?.match(/Batch: ([^,]+)/)?.[1] || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      stockLevel: item.stockLevel || 0
    });
    setIsModalOpen(true);
  };

  const filtered = inventory.filter((m: any) => 
    m.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Pharmacy Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage hospital medicine stock, expiry dates, and alerts.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ brandName: '', genericName: '', batchNumber: '', expiryDate: '', stockLevel: 0 });
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={18} /> Update Stock
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const totalMedicines = inventory.length;
          const outOfStock = inventory.filter((i: any) => i.availability === 'out-of-stock').length;
          const lowStock = inventory.filter((i: any) => i.availability === 'low-stock').length;
          const expiringSoon = inventory.filter((i: any) => {
            if (!i.expiryDate) return false;
            const diffDays = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            return diffDays > 0 && diffDays <= 30; // expiring in next 30 days
          }).length;
          
          return (
            <>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Items</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalMedicines}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Out of Stock</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#991B1B' }}>{outOfStock}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Low Stock</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9A3412' }}>{lowStock}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Expiring &lt; 30 Days</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B45309' }}>{expiringSoon}</div>
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
            placeholder="Search medicine brand or generic name..."
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
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No medicine inventory found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Medicine</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Generic Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Availability</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expiry Date</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => {
                const diffDays = item.expiryDate ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                const isExpiring = diffDays !== null && diffDays <= 30 && diffDays > 0;
                const isExpired = diffDays !== null && diffDays <= 0;

                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Pill size={16} color="var(--teal)" />
                        {item.medicineName}
                      </div>
                      {item.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.notes}</div>}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.genericName || '-'}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.stockLevel}</td>
                    <td style={{ padding: '1rem' }}>
                      {item.availability === 'available' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={12} /> Available</span>}
                      {item.availability === 'low-stock' && <span style={{ color: '#9A3412', background: '#FFEDD5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><TrendingDown size={12} /> Low Stock</span>}
                      {item.availability === 'out-of-stock' && <span style={{ color: '#991B1B', background: '#FEE2E2', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><AlertTriangle size={12} /> Out of Stock</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {item.expiryDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: isExpired ? '#991B1B' : isExpiring ? '#B45309' : 'var(--text-secondary)', fontWeight: (isExpiring || isExpired) ? 600 : 400 }}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                          {isExpired && <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>Expired</span>}
                          {isExpiring && <span style={{ background: '#FEF08A', color: '#B45309', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>Soon</span>}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <Edit2 size={16} /> Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Pill size={24} color="var(--teal)" /> Update Medicine Stock
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Brand Name *</label>
                  <input 
                    type="text" required 
                    value={formData.brandName} onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Generic Name *</label>
                  <input 
                    type="text" required 
                    value={formData.genericName} onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Stock Level *</label>
                  <input 
                    type="number" required min={0}
                    value={formData.stockLevel} onChange={(e) => setFormData({...formData, stockLevel: parseInt(e.target.value) || 0})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Batch Number</label>
                  <input 
                    type="text" 
                    value={formData.batchNumber} onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Expiry Date</label>
                  <input 
                    type="date" 
                    value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={updateMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: updateMutation.isPending ? 0.7 : 1 }}>
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
