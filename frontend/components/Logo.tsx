'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}

export function Logo({ size = 'md', showTagline = false, href = '/' }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const heights = { sm: 28, md: 36, lg: 48 };
  const widths  = { sm: 105, md: 135, lg: 180 };

  const logoSrc = mounted && resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo.svg';

  const logoEl = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src={logoSrc}
        alt="LankaCare — National Digital Health Platform"
        width={widths[size]}
        height={heights[size]}
        priority
        style={{ height: heights[size], width: 'auto' }}
      />
      {showTagline && (
        <span
          style={{
            display: 'block',
            fontSize: '0.625rem',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          National Digital Health Platform
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} aria-label="LankaCare Home" style={{ display: 'inline-flex', alignItems: 'center' }}>
      {logoEl}
    </Link>
  ) : logoEl;
}
