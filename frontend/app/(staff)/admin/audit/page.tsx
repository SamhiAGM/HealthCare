'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function AuditPage() {
  const [searchAction, setSearchAction] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', searchAction, successFilter, page],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = new URL(`${API}/api/v1/audit`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '25');
      if (searchAction) url.searchParams.append('action', searchAction);
      if (successFilter !== '') url.searchParams.append('success', successFilter);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });

  const logs = data?.data || [];
  const totalPages = data?.pages || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={28} color="var(--teal)" /> Audit Log
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Complete record of all system actions and authentication events.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search by action..." value={searchAction} onChange={(e) => { setSearchAction(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
        </div>
        <select value={successFilter} onChange={(e) => { setSuccessFilter(e.target.value); setPage(1); }} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">All</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading audit logs...</div>
          : logs.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No audit logs found.</div>
          : <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead><tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Timestamp</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resource</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              </tr></thead>
              <tbody>{logs.map((log: any) => (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.userId?.name || 'System'}</div>
                    {log.userId?.role && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.userId.role}</div>}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ background: 'var(--bg-soft)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>{log.resource || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {log.success
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#166534', width: 'fit-content' }}><CheckCircle size={14} />OK</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#991B1B', width: 'fit-content' }}><XCircle size={14} />Failed</span>
                    }
                  </td>
                </tr>
              ))}</tbody>
            </table>}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
          <span style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === totalPages ? 0.5 : 1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}
