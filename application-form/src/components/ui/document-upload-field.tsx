import { type ChangeEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText } from 'lucide-react';

export interface DocumentUploadFieldProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string | File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  children?: ReactNode;
}

const DocumentUploadField = ({
  label,
  accept = 'application/pdf',
  maxSizeMB = 5,
  value,
  onChange,
  error,
  disabled = false,
  children,
}: DocumentUploadFieldProps) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      onChange?.(null);
      return;
    }

    if (file.type !== accept) {
      alert(`Please upload a valid ${label}. Only PDF files are accepted.`);
      e.target.value = '';
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`${label} exceeds ${maxSizeMB}MB limit. Please select a smaller file.`);
      e.target.value = '';
      return;
    }

    onChange?.(file);
  };

  const displayedValue = typeof value === 'string' ? value : (value && (value as File)?.name) || '';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold tracking-wide text-gray-900">
        {label} {'*'}
      </label>

      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />

        <button
          type="button"
          className={cn(
            'w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white/90 p-6 text-center transition-all duration-200 hover:border-primary/60 hover:bg-primary-50/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            disabled && 'cursor-not-allowed bg-gray-50 text-gray-400'
          )}
          onClick={() => {
            if (!disabled) {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
              if (input) input.click();
            }
          }}
          disabled={disabled}
        >
          {children ? (
            children
          ) : displayedValue ? (
            <>
              <FileText className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
              <p className="font-medium text-gray-900">{displayedValue}</p>
              {(value as File)?.size && (
                <p className="mt-1 text-xs text-gray-500">{Math.round((value as File).size / 1024)} KB</p>
              )}
            </>
          ) : (
            <>
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">Click or drag to upload {label.toLowerCase()}</p>
              <p className="mt-1 text-xs text-gray-400">PDF only, max {maxSizeMB}MB</p>
            </>
          )}
        </button>
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
};

export default DocumentUploadField;
