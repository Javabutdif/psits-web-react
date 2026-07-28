// src/components/ui/badge.tsx

import { type HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  children: ReactNode;
}

const Badge = ({ 
  className, 
  variant = 'secondary', 
  children, 
  ...props 
}: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-primary text-white shadow-sm shadow-primary/20',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
