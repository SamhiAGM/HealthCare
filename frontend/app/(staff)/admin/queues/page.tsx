'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle, Volume2, Users, UserCheck, Play, Pause } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QueuesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/hospital-admin/departments`, { credentials: 'include' });
      const data = await res.json();
      return data.data || [];
    }
  });

  const { data: queues = [], isLoading } = useQuery({
    queryKey: ['admin-queues', selectedDepartment],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = new URL(`${API}/api/v1/queues`);
      if (selectedDepartment) url.searchParams.append('departmentId', selectedDepartment);
      
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch queues');
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 5000 // Poll every 5s for live updates
  });

  const generateTokenMutation = useMutation({
    mutationFn: async (departmentId: string) => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/queues/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ departmentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to generate token');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Generated token ${data.data.tokenNumber}`);
      queryClient.invalidateQueries({ queryKey: ['admin-queues'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/v1/queues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-queues'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const filtered = queues.filter((q: any) => 
    q.tokenNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>OPD & Queues</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage live hospital queues and walk-in tokens.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <button 
            onClick={() => {
              if (!selectedDepartment) return toast.error('Please select a department first');
              generateTokenMutation.mutate(selectedDepartment);
            }}
            disabled={generateTokenMutation.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: generateTokenMutation.isPending ? 0.7 : 1 }}
          >
            <Plus size={18} /> Walk-in Token
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const waiting = queues.filter((q: any) => q.status === 'Waiting' || q.status === 'Approaching').length;
          const called = queues.filter((q: any) => q.status === 'Called').length;
          const consultation = queues.filter((q: any) => q.status === 'In-Consultation').length;
          
          return (
            <>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Waiting Patients</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{waiting}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Currently Called</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B45309' }}>{called}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>In Consultation</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>{consultation}</div>
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
            placeholder="Search token or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading queues...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active queues found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Token</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--teal)' }}>{item.tokenNumber}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.citizenId?.name || 'Walk-in'}</div>
                    {item.citizenId && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>NIC: {item.citizenId.nic}</div>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.departmentId?.name || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    {item.status === 'Waiting' && <span style={{ color: '#4B5563', background: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><Users size={12} /> Waiting</span>}
                    {item.status === 'Approaching' && <span style={{ color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><Users size={12} /> Approaching</span>}
                    {item.status === 'Called' && <span style={{ color: '#9A3412', background: '#FFEDD5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><Volume2 size={12} /> Called</span>}
                    {item.status === 'In-Consultation' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><UserCheck size={12} /> In Consultation</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['Waiting', 'Approaching'].includes(item.status) && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: item._id, status: 'Called' })}
                          style={{ background: '#FFEDD5', border: 'none', color: '#9A3412', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          <Volume2 size={14} /> Call
                        </button>
                      )}
                      {item.status === 'Called' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: item._id, status: 'In-Consultation' })}
                          style={{ background: '#DCFCE7', border: 'none', color: '#166534', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          <Play size={14} /> Start
                        </button>
                      )}
                      {item.status === 'In-Consultation' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: item._id, status: 'Completed' })}
                          style={{ background: '#F3F4F6', border: 'none', color: '#4B5563', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          <CheckCircle size={14} /> Done
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
