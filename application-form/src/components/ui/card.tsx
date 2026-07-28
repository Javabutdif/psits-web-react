// src/components/ui/card.tsx

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Card = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => {
  return (
    <div className={cn("bg-white rounded-xl border shadow-sm overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>
    {children}
  </div>
);

Card.Title = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) => (
  <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
    {children}
  </h3>
);

Card.Description = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) => (
  <p className={cn("text-sm text-gray-600", className)} {...props}>
    {children}
  </p>
);

Card.Content = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

Card.Footer = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
  <div className={cn("px-6 py-4 border-t border-gray-100", className)} {...props}>
    {children}
  </div>
);

export default Card;
