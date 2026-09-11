'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ userId: '', shiftId: '', status: 'PRESENT', notes: '' });

  // Fetch staff for dropdown
  const { data: staffList = [] } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/hospital-admin/staff`, { credentials: 'include' });
      const data = await res.json();
      return data.data || [];
    }
  });

  // Fetch shifts for dropdown
  const { data: shifts = [] } = useQuery({
    queryKey: ['admin-shifts'],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/hospital-admin/shifts`, { credentials: 'include' });
      const data = await res.json();
      return data.data || [];
    }
  });

  // Fetch attendance for selected date
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['admin-attendance', selectedDate],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/hospital-admin/attendance?date=${selectedDate}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      return data.data;
    }
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/hospital-admin/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...payload, date: selectedDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to mark attendance');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Attendance recorded');
      queryClient.invalidateQueries({ queryKey: ['admin-attendance', selectedDate] });
      setIsModalOpen(false);
      setFormData({ userId: '', shiftId: '', status: 'PRESENT', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) return toast.error('Please select a staff member');
    markAttendanceMutation.mutate(formData);
  };

  const filtered = attendanceRecords.filter((record: any) => {
    const userStr = `${record.userId?.email} ${record.userId?.staffId}`.toLowerCase();
    return userStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Attendance</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage staff daily attendance and shifts.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={18} /> Mark Attendance
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search attendance by staff ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading attendance...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found for {selectedDate}.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Staff Member</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Shift</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record: any) => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    <div style={{ fontWeight: 600 }}>{record.userId?.staffId || 'No ID'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{record.userId?.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-flex', padding: '0.25rem 0.5rem', background: 'var(--bg)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {record.userId?.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {record.shiftId ? (
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{record.shiftId.name}</div>
                        <div style={{ fontSize: '0.85rem' }}>{record.shiftId.startTime} - {record.shiftId.endTime}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {record.status === 'PRESENT' && <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>PRESENT</span>}
                    {record.status === 'ABSENT' && <span style={{ color: '#991B1B', background: '#FEE2E2', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>ABSENT</span>}
                    {record.status === 'LEAVE' && <span style={{ color: '#854D0E', background: '#FEF08A', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>LEAVE</span>}
                    {record.status === 'LATE' && <span style={{ color: '#9A3412', background: '#FFEDD5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>LATE</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {record.notes || '-'}
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
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Mark Attendance</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Staff Member</label>
                <select 
                  required 
                  value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select Staff</option>
                  {staffList.map((s: any) => (
                    <option key={s._id} value={s._id}>{s.email} ({s.staffId}) - {s.role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Shift (Optional)</label>
                <select 
                  value={formData.shiftId} onChange={(e) => setFormData({...formData, shiftId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  <option value="">No specific shift</option>
                  {shifts.map((s: any) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</label>
                <select 
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Notes</label>
                <input 
                  type="text"
                  placeholder="e.g., Arrived 30 mins late"
                  value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={markAttendanceMutation.isPending} style={{ padding: '0.75rem 1.25rem', background: 'var(--teal)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white', opacity: markAttendanceMutation.isPending ? 0.7 : 1 }}>
                  {markAttendanceMutation.isPending ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
