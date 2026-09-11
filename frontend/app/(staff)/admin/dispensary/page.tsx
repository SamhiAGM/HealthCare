'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pill, CheckCircle, Clock, AlertTriangle, FileText, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DispensaryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const { data: hospitalId } = useQuery({
    queryKey: ['hospital-id'],
    queryFn: async () => {
      // In a real app we'd get this from user profile context. Using a fixed local approach or query string for demo.
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/auth/me`, { credentials: 'include' });
      const data = await res.json();
      return data.user?.hospitalId;
    }
  });

  const { data: pendingPrescriptions = [], isLoading } = useQuery({
    queryKey: ['admin-dispensary', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return [];
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/pharmacy/hospital/${hospitalId}/pending`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch pending prescriptions');
      const data = await res.json();
      return data.data;
    },
    enabled: !!hospitalId,
    refetchInterval: 10000 // Poll every 10s
  });

  const dispenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/pharmacy/prescriptions/${id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'Dispense' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to dispense');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Prescription dispensed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-dispensary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacy'] }); // Refresh inventory
      setSelectedPrescription(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription) return;
    dispenseMutation.mutate(selectedPrescription._id);
  };

  const filtered = pendingPrescriptions.filter((p: any) => 
    p.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.citizenId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.citizenId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.citizenId?.nic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Pharmacy Dispensary</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage incoming prescriptions and dispense medicine to patients.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Pending Prescriptions</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626' }}>{pendingPrescriptions.length}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Action Required</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B45309' }}>{pendingPrescriptions.filter((p: any) => p.dispenseStatus === 'Pending').length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search Rx No, Patient Name, or NIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading pending prescriptions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No pending prescriptions at the moment.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rx Number</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Doctor</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Items</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Issued</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} />
                      {item.prescriptionNumber}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.citizenId?.firstName} {item.citizenId?.lastName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>NIC: {item.citizenId?.nic}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {item.doctorId ? `Dr. ${item.doctorId.firstName} ${item.doctorId.lastName}` : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.items.length} Medicines</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {new Date(item.issueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => setSelectedPrescription(item)}
                      style={{ background: '#FEF2F2', border: 'none', color: '#DC2626', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      <ArrowRightCircle size={16} /> Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dispense Modal */}
      {selectedPrescription && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '700px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Pill size={24} color="#DC2626" /> Dispense Prescription
              </h2>
              <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.875rem' }}>
                {selectedPrescription.prescriptionNumber}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Patient Details</h3>
              <div style={{ color: 'var(--text-secondary)' }}>
                <strong>Name:</strong> {selectedPrescription.citizenId?.firstName} {selectedPrescription.citizenId?.lastName} <br />
                <strong>NIC:</strong> {selectedPrescription.citizenId?.nic} <br />
                <strong>Prescribed by:</strong> Dr. {selectedPrescription.doctorId?.firstName} {selectedPrescription.doctorId?.lastName}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Medicines to Dispense</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Medicine</th>
                      <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dosage</th>
                      <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration</th>
                      <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.medicineName}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{item.dosage} - {item.frequency}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{item.durationDays} days</td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: '#166534', fontSize: '1.1rem' }}>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '1rem', background: '#FEF08A', color: '#854D0E', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                <AlertTriangle size={16} /> Dispensing will automatically deduct the quantities above from the pharmacy inventory.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="button" onClick={() => setSelectedPrescription(null)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button 
                onClick={handleDispense} 
                disabled={dispenseMutation.isPending} 
                style={{ padding: '0.75rem 1.5rem', background: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: dispenseMutation.isPending ? 0.7 : 1 }}
              >
                {dispenseMutation.isPending ? 'Processing...' : <><CheckCircle size={18} /> Confirm Dispense</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
