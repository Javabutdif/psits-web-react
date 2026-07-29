import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'normal' | 'lg';
  children: ReactNode;
  asChild?: boolean;
}

const Button = ({
  className,
  variant = 'primary',
  size = 'normal',
  children,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/20',
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
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};

export default Button;
