'use client';

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, WifiOff } from 'lucide-react';

type FreshnessLevel = 'live' | 'recent' | 'stale' | 'unavailable' | 'static';

interface DataFreshnessLabelProps {
  level: FreshnessLevel;
  lastUpdated?: Date | string | null;
  label?: string;
  compact?: boolean;
}

const config: Record<FreshnessLevel, {
  icon: React.ReactNode;
  text: string;
  className: string;
  dotClass: string;
}> = {
  live:        { icon: <CheckCircle size={11}/>, text: 'LIVE',     className: 'fresh-live',    dotClass: 'status-dot-live' },
  recent:      { icon: <CheckCircle size={11}/>, text: 'RECENT',   className: 'fresh-recent',  dotClass: '' },
  stale:       { icon: <Clock size={11}/>,       text: 'STALE',    className: 'fresh-stale',   dotClass: 'status-dot-stale' },
  unavailable: { icon: <WifiOff size={11}/>,     text: 'UNAVAIL',  className: 'fresh-unavail', dotClass: 'status-dot-unavail' },
  static:      { icon: <CheckCircle size={11}/>, text: 'VERIFIED', className: 'fresh-recent',  dotClass: '' },
};

export function DataFreshnessLabel({
  level,
  lastUpdated,
  label,
  compact = false,
}: DataFreshnessLabelProps) {
  const c = config[level];

  const timeAgo = lastUpdated ? formatTimeAgo(new Date(lastUpdated)) : null;

  if (compact) {
    return (
      <span
        className={c.className}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }}
        title={timeAgo || undefined}
      >
        {c.dotClass && <span className={`status-dot ${c.dotClass}`} />}
        {c.text}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <span
        className={c.className}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}
      >
        {c.dotClass && <span className={`status-dot ${c.dotClass}`} />}
        {c.icon}
        {label || c.text}
      </span>
      {timeAgo && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          · Updated {timeAgo}
        </span>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)  return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* ─── Crowd Level Badge ──────────────────────────────────────────────── */
type CrowdLevel = 'low' | 'moderate' | 'busy' | 'very-busy' | 'unknown';

interface CrowdBadgeProps { level: CrowdLevel; showIcon?: boolean; }

const crowdConfig: Record<CrowdLevel, { text: string; icon: string; class: string }> = {
  'low':      { text: 'Low',       icon: '🟢', class: 'crowd-low' },
  'moderate': { text: 'Moderate',  icon: '🟡', class: 'crowd-moderate' },
  'busy':     { text: 'Busy',      icon: '🟠', class: 'crowd-busy' },
  'very-busy':{ text: 'Very Busy', icon: '🔴', class: 'crowd-critical' },
  'unknown':  { text: 'Unknown',   icon: '⚪', class: '' },
};

export function CrowdBadge({ level, showIcon = true }: CrowdBadgeProps) {
  const c = crowdConfig[level] || crowdConfig.unknown;
  return (
    <span
      className={c.class}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', fontWeight: 600 }}
      aria-label={`Crowd level: ${c.text}`}
    >
      {showIcon && <span aria-hidden="true" style={{ fontSize: '0.7rem' }}>{c.icon}</span>}
      {c.text}
    </span>
  );
}

/* ─── Availability Badge ──────────────────────────────────────────────── */
type AvailabilityLevel = 'available' | 'limited' | 'low-stock' | 'out-of-stock' | 'unknown';

interface AvailabilityBadgeProps { level: AvailabilityLevel; label?: string; }

const availConfig: Record<AvailabilityLevel, { cls: string; dot: string; text: string }> = {
  'available':    { cls: 'lc-badge lc-badge-success', dot: '●', text: 'Available' },
  'limited':      { cls: 'lc-badge lc-badge-warning', dot: '●', text: 'Limited' },
  'low-stock':    { cls: 'lc-badge lc-badge-warning', dot: '●', text: 'Low Stock' },
  'out-of-stock': { cls: 'lc-badge lc-badge-danger',  dot: '●', text: 'Out of Stock' },
  'unknown':      { cls: 'lc-badge lc-badge-neutral', dot: '●', text: 'Unknown' },
};

export function AvailabilityBadge({ level, label }: AvailabilityBadgeProps) {
  const c = availConfig[level] || availConfig.unknown;
  return (
    <span className={c.cls} aria-label={`Availability: ${label || c.text}`}>
      <span aria-hidden="true" style={{ fontSize: '0.5rem', lineHeight: 1 }}>{c.dot}</span>
      {label || c.text}
    </span>
  );
}

/* ─── Blood Status Badge ──────────────────────────────────────────────── */
type BloodStatus = 'adequate' | 'moderate' | 'low' | 'critical';

const bloodConfig: Record<BloodStatus, { cls: string; text: string }> = {
  'adequate': { cls: 'lc-badge lc-badge-success', text: 'Adequate' },
  'moderate': { cls: 'lc-badge lc-badge-info',    text: 'Moderate' },
  'low':      { cls: 'lc-badge lc-badge-warning', text: 'Low' },
  'critical': { cls: 'lc-badge lc-badge-danger',  text: 'Critical' },
};

export function BloodStatusBadge({ status, label }: { status: BloodStatus; label?: string }) {
  const c = bloodConfig[status];
  return <span className={c.cls}>{label || c.text}</span>;
}

/* ─── Verification Badge ──────────────────────────────────────────────── */
export function VerificationBadge({ status }: { status: 'Verified' | 'Pending' | 'Unverified' }) {
  const cls =
    status === 'Verified' ? 'lc-badge lc-badge-success' :
    status === 'Pending'  ? 'lc-badge lc-badge-warning' :
                            'lc-badge lc-badge-neutral';
  return <span className={cls}>{status}</span>;
}
