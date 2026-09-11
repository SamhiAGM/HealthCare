'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, User, Key, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
    fetch(`${API}/api/v1/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} color="var(--teal)" /> Account Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information, security preferences, and notifications.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {[
          { id: 'profile', label: 'Profile Information', icon: <User size={16} /> },
          { id: 'security', label: 'Security & Login', icon: <Shield size={16} /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ 
              padding: '0.75rem 1rem', background: 'none', border: 'none', 
              borderBottom: `2.5px solid ${activeTab === tab.id ? 'var(--teal)' : 'transparent'}`, 
              color: activeTab === tab.id ? 'var(--teal)' : 'var(--text-secondary)', 
              fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', fontSize: '0.9375rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
        {activeTab === 'profile' && (
          <div className="lc-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Personal Information</h2>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader2 size={24} className="spin" color="var(--teal)" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <Input label="First Name" id="firstName" defaultValue={userData?.citizen?.firstName || ''} />
                <Input label="Last Name" id="lastName" defaultValue={userData?.citizen?.lastName || ''} />
                <Input label="Mobile Number" id="mobile" defaultValue={userData?.user?.mobile || ''} />
                <Input label="Email Address" id="email" type="email" defaultValue={userData?.user?.email || ''} />
                <Input label="Date of Birth" id="dob" type="date" defaultValue={userData?.citizen?.dateOfBirth ? userData.citizen.dateOfBirth.split('T')[0] : ''} disabled />
                <Input label="Gender" id="gender" defaultValue={userData?.citizen?.gender || ''} disabled />
              </div>
            )}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Changes
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="lc-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--teal)" /> Change Password
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 400 }}>
              <Input label="Current Password" id="currentPassword" type="password" />
              <Input label="New Password" id="newPassword" type="password" />
              <Input label="Confirm New Password" id="confirmNewPassword" type="password" />
              <Button variant="primary" style={{ marginTop: '0.5rem' }}>Update Password</Button>
            </div>

            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '2.5rem 0 1rem' }}>Two-Factor Authentication (2FA)</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>SMS Authentication</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receive a code via SMS when logging in.</div>
              </div>
              <Button variant="secondary" size="sm">Enable</Button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="lc-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Notification Preferences</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Appointment Reminders', desc: 'Get SMS reminders 24 hours before your clinic visit.' },
                { title: 'Queue Updates', desc: 'Receive live SMS updates when your turn is approaching.' },
                { title: 'Prescription Refills', desc: 'Get notified when it is time to refill your medication.' },
                { title: 'Lab Results', desc: 'Receive an email when new lab results are uploaded.' },
              ].map(item => (
                <label key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ marginTop: 4, width: 18, height: 18, accentColor: 'var(--teal)' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Preferences
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
