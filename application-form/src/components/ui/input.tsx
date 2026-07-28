// src/components/ui/input.tsx

import { type InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  prepend?: ReactNode;
  append?: ReactNode;
}

const Input = ({ className, prepend, append, ...props }: InputProps) => {
  const inputClasses = cn(
    "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:font-medium file:text-primary placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    prepend && 'pl-8',
    append && 'pr-8',
    className
  );

  return (
    <div className="relative">
      {prepend && (
        <div className="absolute left-0 top-0 flex items-center pl-3 h-full pointer-events-none">
          {prepend}
        </div>
      )}
       <input
        className={inputClasses}
        {...props}
      />
      {append && (
        <div className="absolute right-0 top-0 flex items-center pr-3 h-full pointer-events-none">
          {append}
        </div>
      )}
    </div>
  );
};

export default Input;
