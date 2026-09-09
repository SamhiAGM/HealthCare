'use client';

import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'lc-btn-primary',
  secondary: 'lc-btn-secondary',
  accent: 'lc-btn-accent',
  ghost: 'lc-btn-ghost',
  danger: 'lc-btn-danger',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm gap-1.5',
  md: 'py-2.5 px-5 text-[0.9375rem]',
  lg: 'py-3.5 px-7 text-base',
  icon: 'p-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClass = variantStyles[variant];
    const sizeClass = sizeStyles[size];
    const widthClass = fullWidth ? 'w-full' : '';
    const extraClass = className;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        className={[baseClass, sizeClass, widthClass, extraClass].filter(Boolean).join(' ')}
        {...props}
      >
        {loading ? (
          <span
            style={{
              width: 16,
              height: 16,
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        ) : leftIcon ? (
          <span aria-hidden="true" style={{ display: 'flex', flexShrink: 0 }}>{leftIcon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {!loading && rightIcon && (
          <span aria-hidden="true" style={{ display: 'flex', flexShrink: 0 }}>{rightIcon}</span>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';
