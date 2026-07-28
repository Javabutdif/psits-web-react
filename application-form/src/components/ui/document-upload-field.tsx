// src/components/ui/document-upload-field.tsx

import { type ChangeEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
  children
}: DocumentUploadFieldProps) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      onChange?.(null);
      return;
    }

    // Validate file type
    if (file.type !== accept) {
      alert(`Please upload a valid ${label}. Only PDF files are accepted.`);
      e.target.value = ''; // Reset the input
      return;
    }

    // Validate file size
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
        />
        
        <button
          type="button"
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white/90 p-6 text-center transition-all duration-200 hover:border-primary/60 hover:bg-primary-50/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
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
              <svg className="mx-auto mb-2 h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium text-gray-900">{displayedValue}</p>
              <p className="text-xs text-gray-500 mt-1">{(value as File)?.size ? Math.round((value as File).size / 1024) + ' KB' : ''}</p>
            </>
          ) : (
            <>
              <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">Click or drag to upload {label.toLowerCase()}</p>
              <p className="text-xs text-gray-400 mt-1">PDF only, max {maxSizeMB}MB</p>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
};

export default DocumentUploadField;
