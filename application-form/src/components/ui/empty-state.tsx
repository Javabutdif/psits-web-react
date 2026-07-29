import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import Button from './button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
        {icon || <FileText className="h-8 w-8" />}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-600">{description}</p>}
      {action && (
        <Button variant="primary" className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
