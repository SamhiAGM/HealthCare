'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = 'text',
      id,
      required,
      hideLabel = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPw, setShowPw] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPw ? 'text' : 'password') : type;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            className={hideLabel ? 'sr-only' : ''}
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            {label}
            {required && (
              <span style={{ color: '#DC2626', marginLeft: '0.25rem' }} aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={`lc-input ${className}`}
            style={{
              paddingLeft: leftIcon ? '2.5rem' : undefined,
              paddingRight: (rightIcon || isPassword) ? '2.75rem' : undefined,
              borderColor: error ? '#DC2626' : undefined,
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px',
                borderRadius: '4px',
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8125rem',
              color: '#DC2626',
              marginTop: '0.125rem',
            }}
          >
            <AlertCircle size={13} aria-hidden="true" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ─── Select ──────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, id, required, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            {label}
            {required && <span style={{ color: '#DC2626', marginLeft: '0.25rem' }}>*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          className={`lc-input ${className}`}
          style={{ cursor: 'pointer', borderColor: error ? '#DC2626' : undefined }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && (
          <p role="alert" style={{ fontSize: '0.8125rem', color: '#DC2626' }}>{error}</p>
        )}
        {hint && !error && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
