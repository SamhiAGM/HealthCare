'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, FlaskConical, CheckCircle, Activity, FileText, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LabPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
  const [resultData, setResultData] = useState({
    resultSummary: '',
    interpretation: 'Normal'
  });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['admin-lab-tests'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/lab`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch lab tests');
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 10000 // Poll every 10s
  });

  const completeMutation = useMutation({
    mutationFn: async (payload: { id: string, data: any }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/lab/${payload.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to complete test');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Test results saved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-lab-tests'] });
      setSelectedTest(null);
      setResultData({ resultSummary: '', interpretation: 'Normal' });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    completeMutation.mutate({ id: selectedTest._id, data: resultData });
  };

  const filtered = tests.filter((t: any) => 
    t.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.citizenId?.nic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Laboratory & Radiology</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Process ordered tests and enter results.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const total = tests.length;
          const pending = tests.filter((t: any) => t.status === 'Pending').length;
          const completed = tests.filter((t: any) => t.status === 'Completed').length;
          
          return (
            <>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Orders</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Pending Processing</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B45309' }}>{pending}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Completed Today</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>{completed}</div>
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
            placeholder="Search test name, patient, or NIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No lab tests found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Test / Category</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ordered By</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FlaskConical size={16} color="var(--teal)" /> {item.testName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.citizenId?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>NIC: {item.citizenId?.nic}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {item.doctorId ? `${item.doctorId.title} ${item.doctorId.name}` : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'Pending' && <span style={{ color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><Activity size={12} /> Pending</span>}
                    {item.status === 'Completed' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={12} /> Completed</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'Pending' ? (
                      <button 
                        onClick={() => setSelectedTest(item)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                      >
                        <ArrowRightCircle size={16} /> Enter Result
                      </button>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {item.interpretation}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Result Entry Modal */}
      {selectedTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FlaskConical size={24} color="var(--teal)" /> Enter Lab Result
            </h2>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedTest.testName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient: {selectedTest.citizenId?.name} (NIC: {selectedTest.citizenId?.nic})</div>
            </div>

            <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Interpretation *</label>
                <select 
                  required 
                  value={resultData.interpretation} onChange={(e) => setResultData({...resultData, interpretation: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Abnormal">Abnormal</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Result Summary / Values *</label>
                <textarea 
                  rows={5} required
                  placeholder="Enter test values, measurements, and remarks..."
                  value={resultData.resultSummary} onChange={(e) => setResultData({...resultData, resultSummary: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedTest(null)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={completeMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: completeMutation.isPending ? 0.7 : 1 }}>
                  {completeMutation.isPending ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
