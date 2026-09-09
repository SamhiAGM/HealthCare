'use client';

import { useState } from 'react';
import { Users, Search, UserPlus, Mail, Phone, Edit2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/Button';

export default function HospitalStaffPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const staff = [
    { id: '1', name: 'Dr. S. Perera', role: 'Chief Medical Officer', department: 'Cardiology', phone: '071 123 4567', email: 's.perera@nhsl.gov.lk', status: 'Active' },
    { id: '2', name: 'Dr. K. Silva', role: 'Consultant', department: 'ENT', phone: '077 234 5678', email: 'k.silva@nhsl.gov.lk', status: 'Active' },
    { id: '3', name: 'Nrs. A. Fernando', role: 'Head Nurse', department: 'ICU', phone: '072 345 6789', email: 'a.fernando@nhsl.gov.lk', status: 'Active' },
    { id: '4', name: 'Mr. P. Bandara', role: 'Pharmacist', department: 'Pharmacy', phone: '070 456 7890', email: 'p.bandara@nhsl.gov.lk', status: 'On Leave' },
    { id: '5', name: 'Dr. R. Jayakody', role: 'Consultant', department: 'Neurology', phone: '078 567 8901', email: 'r.jayakody@nhsl.gov.lk', status: 'Active' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--teal)" /> Staff Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage hospital staff access, roles, and contact information.</p>
        </div>
        <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={16} /> Add Staff Member
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            placeholder="Search name, role, or department..."
            className="lc-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <select className="lc-input" style={{ width: 'auto' }}>
          <option>All Departments</option>
          <option>Cardiology</option>
          <option>ENT</option>
          <option>ICU</option>
          <option>Pharmacy</option>
        </select>
        <select className="lc-input" style={{ width: 'auto' }}>
          <option>All Roles</option>
          <option>Doctor</option>
          <option>Nurse</option>
          <option>Pharmacist</option>
          <option>Admin</option>
        </select>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Name & Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Department</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Contact</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>System Access</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i === staff.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.role}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {s.department}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}><Phone size={12} /> {s.phone}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Mail size={12} /> {s.email}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {s.role === 'Chief Medical Officer' || s.role === 'Consultant' ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 999, background: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldAlert size={12} /> DOCTOR
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 999, background: '#F3F4F6', color: '#4B5563' }}>
                        {s.role.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{ padding: '0.375rem', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--teal)', cursor: 'pointer' }} aria-label="Edit">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
