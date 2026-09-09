'use client';

import React from 'react';

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  className?: string;
}

export function Skeleton({ height = 16, width = '100%', borderRadius = 8, className = '' }: SkeletonProps) {
  return (
    <span
      className={`lc-skeleton ${className}`}
      aria-hidden="true"
      style={{
        display: 'block',
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
    />
  );
}

export function HospitalCardSkeleton() {
  return (
    <div className="lc-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Skeleton height={20} width="60%" />
        <Skeleton height={22} width={70} borderRadius={999} />
      </div>
      <Skeleton height={14} width="40%" />
      <Skeleton height={14} width="35%" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <Skeleton height={26} width={70} borderRadius={999} />
        <Skeleton height={26} width={80} borderRadius={999} />
        <Skeleton height={26} width={65} borderRadius={999} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <Skeleton height={36} width={110} borderRadius={8} />
        <Skeleton height={36} width={90} borderRadius={8} />
      </div>
    </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="lc-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <Skeleton height={56} width={56} borderRadius={999} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton height={18} width="55%" />
        <Skeleton height={14} width="45%" />
        <Skeleton height={14} width="60%" />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
      <Skeleton height={36} width="40%" />
      <Skeleton height={16} width="65%" />
    </div>
  );
}
