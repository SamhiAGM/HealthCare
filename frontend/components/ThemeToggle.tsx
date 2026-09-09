'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: compact ? 36 : 40,
          height: compact ? 36 : 40,
          borderRadius: 8,
          background: 'var(--bg-muted)',
        }}
      />
    );
  }

  const icons = [
    { value: 'light',  icon: <Sun size={15} />,     label: 'Light mode' },
    { value: 'dark',   icon: <Moon size={15} />,    label: 'Dark mode' },
    { value: 'system', icon: <Monitor size={15} />, label: 'System default' },
  ];

  if (compact) {
    const current = resolvedTheme === 'dark' ? icons[1] : icons[0];
    const next    = resolvedTheme === 'dark' ? 'light' : 'dark';
    return (
      <button
        onClick={() => setTheme(next)}
        aria-label={current.label}
        title={current.label}
        style={{
          background: 'var(--bg-muted)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {current.icon}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Choose theme"
      style={{
        display: 'flex',
        background: 'var(--bg-muted)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '3px',
        gap: '2px',
      }}
    >
      {icons.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          style={{
            background: theme === value ? 'var(--bg-card)' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            padding: '0.375rem 0.5rem',
            cursor: 'pointer',
            color: theme === value ? 'var(--teal)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            boxShadow: theme === value ? 'var(--shadow-card)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
