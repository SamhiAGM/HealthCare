'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, Bed, RefreshCw, AlertTriangle, CheckCircle2, Droplet } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function AdminDashboard() {
  const [beds, setBeds] = useState<any[]>([]);
  const [blood, setBlood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // MOCK hospitalId for demo
  const hospitalId = 'mock-hospital-id';
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const bedRes = await fetch(`${API}/api/v1/admin/beds?hospitalId=${hospitalId}`, { credentials: 'include' });
      const bloodRes = await fetch(`${API}/api/v1/admin/blood?hospitalId=${hospitalId}`, { credentials: 'include' });
      
      const bedData = await bedRes.json();
      const bloodData = await bloodRes.json();

      if (bedData.success) setBeds(bedData.data);
      if (bloodData.success) setBlood(bloodData.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOccupiedChange = (bedId: string, newOccupied: number) => {
    setBeds(prev => prev.map(b => b._id === bedId ? { ...b, occupied: newOccupied } : b));
  };

  const handleTotalChange = (bedId: string, newTotal: number) => {
    setBeds(prev => prev.map(b => b._id === bedId ? { ...b, total: newTotal } : b));
  };

  const handleSaveBed = async (bed: any) => {
    setSaving(true);
    try {
      if (bed.occupied > bed.total) {
        alert('Occupied beds cannot exceed total capacity.');
        setSaving(false);
        return;
      }

      const res = await fetch(`${API}/api/v1/admin/beds/${bed._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: bed.total,
          occupied: bed.occupied
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setBeds(prev => prev.map(b => b._id === bed._id ? data.data : b));
        alert(`${bed.wardType} capacity updated successfully.`);
      } else {
        alert('Failed to update bed capacity. Ensure you are logged in as HOSPITAL_ADMIN.');
      }
    } catch (e) {
      alert('Error updating capacity');
    }
    setSaving(false);
  };

  const handleBloodStatusChange = (bloodId: string, status: string) => {
    setBlood(prev => prev.map(b => b._id === bloodId ? { ...b, status } : b));
  };

  const handleBloodUnitsChange = (bloodId: string, units: number) => {
    setBlood(prev => prev.map(b => b._id === bloodId ? { ...b, units } : b));
  };

  const handleSaveBlood = async (b: any) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/blood/${b._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: b.status,
          units: b.units
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setBlood(prev => prev.map(item => item._id === b._id ? data.data : item));
        alert(`Blood group ${b.bloodGroup} updated successfully.`);
      } else {
        alert('Failed to update blood inventory.');
      }
    } catch (e) {
      alert('Error updating blood inventory');
    }
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return { bg: '#dcfce7', text: '#166534' };
      case 'Limited': return { bg: '#fef3c7', text: '#92400e' };
      case 'Critical': return { bg: '#fee2e2', text: '#b91c1c' };
      case 'Full': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#4f46e5', padding: '0.75rem', borderRadius: 12 }}>
            <Building2 size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Hospital Administration</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Live Operational Capacity</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchDashboardData} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <RefreshCw size={16} /> Refresh Data
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading dashboard data...</div>
      ) : (
        <>
          <div className="lc-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Bed size={20} color="#4f46e5" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Ward Bed Inventory</h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {beds.map((bed) => {
              const statusColors = getStatusColor(bed.publicStatus);
              const available = bed.total - bed.occupied;
              const occupancyRate = (bed.occupied / bed.total) * 100 || 0;

              return (
                <div key={bed._id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr', gap: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{bed.wardType} Ward</h3>
                    <div style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, backgroundColor: statusColors.bg, color: statusColors.text, marginBottom: '1rem' }}>
                      {bed.publicStatus}
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{available}</strong> beds currently available
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${occupancyRate}%` }} 
                        style={{ height: '100%', backgroundColor: occupancyRate > 90 ? '#ef4444' : occupancyRate > 75 ? '#f59e0b' : '#10b981' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Capacity</label>
                      <Input 
                        type="number" 
                        value={bed.total} 
                        onChange={(e) => handleTotalChange(bed._id, parseInt(e.target.value) || 0)} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Occupied Beds</label>
                      <Input 
                        type="number" 
                        value={bed.occupied} 
                        onChange={(e) => handleOccupiedChange(bed._id, parseInt(e.target.value) || 0)} 
                      />
                    </div>
                    <Button variant="primary" onClick={() => handleSaveBed(bed)} disabled={saving} style={{ height: 42, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Save size={16} /> Save
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lc-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Droplet size={20} color="#ef4444" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Blood Bank Inventory</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {blood.map((b) => {
              const statusColors = getStatusColor(b.status === 'adequate' ? 'Available' : b.status === 'critical' ? 'Critical' : 'Limited');
              
              return (
                <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
                      {b.bloodGroup}
                    </div>
                    <div>
                      <select 
                        value={b.status} 
                        onChange={(e) => handleBloodStatusChange(b._id, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, backgroundColor: statusColors.bg, color: statusColors.text, outline: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <option value="adequate">Adequate</option>
                        <option value="moderate">Moderate</option>
                        <option value="low">Low</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 80 }}>
                      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Units (ml)</label>
                      <Input 
                        type="number" 
                        value={b.units} 
                        onChange={(e) => handleBloodUnitsChange(b._id, parseInt(e.target.value) || 0)} 
                        style={{ padding: '0.35rem' }}
                      />
                    </div>
                    <Button variant="primary" onClick={() => handleSaveBlood(b)} disabled={saving} style={{ padding: '0.35rem 0.75rem', marginTop: '1rem' }}>
                      <Save size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
      )}
    </div>
  );
}
