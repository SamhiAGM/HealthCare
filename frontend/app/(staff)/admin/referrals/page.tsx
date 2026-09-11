'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const urgencyBadge: any = {
  Routine: { bg: '#F3F4F6', color: '#374151' },
  Urgent: { bg: '#FFEDD5', color: '#9A3412' },
  Emergency: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function ReferralsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [direction, setDirection] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ toHospitalId: '', citizenId: '', reason: '', urgency: 'Routine', notes: '' });

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['admin-referrals', direction],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const url = new URL(`${API}/api/v1/referrals`);
      if (direction) url.searchParams.append('direction', direction);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return (await res.json()).data;
    }
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospitals-list'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/hospitals`, { credentials: 'include' });
      return (await res.json()).data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/referrals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => { toast.success('Referral created'); queryClient.invalidateQueries({ queryKey: ['admin-referrals'] }); setIsCreateOpen(false); setFormData({ toHospitalId: '', citizenId: '', reason: '', urgency: 'Routine', notes: '' }); },
    onError: (e: any) => toast.error(e.message)
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/referrals/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['admin-referrals'] }); },
    onError: (e: any) => toast.error(e.message)
  });

  const filtered = referrals.filter((r: any) =>
    r.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Patient Referrals</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage inter-hospital patient transfers and referrals.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> Create Referral
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search patient or reason..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
        </div>
        <select value={direction} onChange={(e) => setDirection(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
        </select>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No referrals found.</div>
          : <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From → To</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Reason</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Urgency</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr></thead>
              <tbody>{filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.citizenId?.name}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.citizenId?.nic}</div></td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.fromHospitalId?.name}</span>
                      <ArrowRightLeft size={14} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{item.toHospitalId?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>{item.reason}</td>
                  <td style={{ padding: '1rem' }}><span style={{ background: urgencyBadge[item.urgency]?.bg, color: urgencyBadge[item.urgency]?.color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>{item.urgency}</span></td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'Pending' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', width: 'fit-content' }}><Clock size={12} />Pending</span>}
                    {item.status === 'Accepted' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', width: 'fit-content' }}><CheckCircle size={12} />Accepted</span>}
                    {item.status === 'Rejected' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#991B1B', background: '#FEE2E2', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', width: 'fit-content' }}><XCircle size={12} />Rejected</span>}
                    {item.status === 'Completed' && <span style={{ color: '#4B5563', background: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>Completed</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => updateStatusMutation.mutate({ id: item._id, status: 'Accepted' })} style={{ background: '#DCFCE7', border: 'none', color: '#166534', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Accept</button>
                        <button onClick={() => updateStatusMutation.mutate({ id: item._id, status: 'Rejected' })} style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Reject</button>
                      </div>
                    )}
                    {item.status === 'Accepted' && (
                      <button onClick={() => updateStatusMutation.mutate({ id: item._id, status: 'Completed' })} style={{ background: '#F3F4F6', border: 'none', color: '#374151', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Mark Done</button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>}
      </div>

      {isCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><ArrowRightLeft size={24} color="var(--teal)" />Create Referral</h2>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Refer To Hospital *</label>
                <select required value={formData.toHospitalId} onChange={(e) => setFormData({ ...formData, toHospitalId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
                  <option value="">Select Hospital</option>
                  {hospitals.map((h: any) => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient Citizen ID *</label>
                <input type="text" required placeholder="Paste Citizen ObjectId" value={formData.citizenId} onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Reason *</label>
                  <input type="text" required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Urgency *</label>
                  <select value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
                    <option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Notes</label>
                <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit" disabled={createMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }}>{createMutation.isPending ? 'Sending...' : 'Create Referral'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
