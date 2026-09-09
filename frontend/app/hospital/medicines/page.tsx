'use client';

import { useState } from 'react';
import { Pill, Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/Button';
import { AvailabilityBadge } from '@/components/Badges';

export default function HospitalMedicinesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const inventory = [
    { id: '1', name: 'Metformin Hydrochloride', generic: 'Metformin', form: 'Tablet', strength: '500mg', stock: 12500, status: 'available', lastUpdated: '2 hours ago' },
    { id: '2', name: 'Amoxicillin', generic: 'Amoxicillin Trihydrate', form: 'Capsule', strength: '250mg', stock: 850, status: 'limited', lastUpdated: '1 hour ago' },
    { id: '3', name: 'Frusemide', generic: 'Furosemide', form: 'Tablet', strength: '40mg', stock: 0, status: 'out-of-stock', lastUpdated: 'Yesterday' },
    { id: '4', name: 'Salbutamol Inhaler', generic: 'Salbutamol', form: 'Inhaler', strength: '100mcg', stock: 45, status: 'low-stock', lastUpdated: '3 hours ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={24} color="var(--teal)" /> Pharmacy Inventory
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update medicine availability to reflect in the citizen portal instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} /> Filter
          </Button>
          <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Item
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Quick Stats */}
        <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="lc-card" style={{ padding: '1.25rem', borderLeft: '4px solid #DC2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 700, marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} /> Out of Stock
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>14</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Requires immediate restock</div>
          </div>
          <div className="lc-card" style={{ padding: '1.25rem', borderLeft: '4px solid #D97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D97706', fontWeight: 700, marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} /> Low Stock
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>38</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Less than 1 week supply</div>
          </div>
          <div className="lc-card" style={{ padding: '1.25rem', borderLeft: '4px solid #16A34A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', fontWeight: 700, marginBottom: '0.5rem' }}>
              Total Unique Items
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>452</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Tracked in inventory</div>
          </div>
        </div>

        {/* Inventory Table */}
        <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="search" placeholder="Search by name or generic..." className="lc-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Medicine</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Details</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Est. Stock</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Public Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: i === inventory.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.generic}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {item.form} • {item.strength}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.stock.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <AvailabilityBadge level={item.status as any} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Updated {item.lastUpdated}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button variant="outline" size="sm">Update</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
