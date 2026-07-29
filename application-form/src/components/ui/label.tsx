// src/components/ui/label.tsx

import { type LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children: ReactNode;
}

const Label = ({ className, ...props }: LabelProps) => {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-gray-900 mb-1",
        className
      )}
      {...props}
    />
  );
};

export default Label;
