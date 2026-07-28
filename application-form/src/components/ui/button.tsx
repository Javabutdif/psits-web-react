// src/components/ui/button.tsx

import { type ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'normal' | 'lg';
  children: ReactNode;
}

const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'normal', 
  children, 
  ...props 
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
    destructive: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    normal: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
