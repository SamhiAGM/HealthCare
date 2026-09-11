'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Activity, CheckCircle, FlaskConical, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RadiologyPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [resultData, setResultData] = useState({ resultSummary: '', interpretation: 'Normal' });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['admin-radiology'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/lab?category=Imaging`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return (await res.json()).data;
    },
    refetchInterval: 10000
  });

  const completeMutation = useMutation({
    mutationFn: async (payload: { id: string, data: any }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/lab/${payload.id}/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload.data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => { toast.success('Radiology result saved'); queryClient.invalidateQueries({ queryKey: ['admin-radiology'] }); setSelectedTest(null); },
    onError: (e: any) => toast.error(e.message)
  });

  const filtered = tests.filter((t: any) =>
    t.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Radiology</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Process imaging orders (X-Ray, CT, MRI, Ultrasound).</p>
      </div>
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input type="text" placeholder="Search test or patient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No imaging orders found.</div>
          : <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Test</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
              </tr></thead>
              <tbody>{filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FlaskConical size={16} color="var(--teal)" />{item.testName}</div></td>
                  <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.citizenId?.name}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.citizenId?.nic}</div></td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'Pending' && <span style={{ color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>Pending</span>}
                    {item.status === 'Completed' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={12} />Completed</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>{item.status === 'Pending' && <button onClick={() => setSelectedTest(item)} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}><ArrowRightCircle size={16} />Report</button>}</td>
                </tr>
              ))}</tbody>
            </table>}
      </div>
      {selectedTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={24} color="var(--teal)" />Radiology Report</h2>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600 }}>{selectedTest.testName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Patient: {selectedTest.citizenId?.name}</div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); completeMutation.mutate({ id: selectedTest._id, data: resultData }); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Finding *</label>
                <select required value={resultData.interpretation} onChange={(e) => setResultData({ ...resultData, interpretation: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
                  <option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Critical">Critical</option>
                </select>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Report / Findings *</label>
                <textarea rows={5} required value={resultData.resultSummary} onChange={(e) => setResultData({ ...resultData, resultSummary: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedTest(null)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit" disabled={completeMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: completeMutation.isPending ? 0.7 : 1 }}>{completeMutation.isPending ? 'Saving...' : 'Save Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
