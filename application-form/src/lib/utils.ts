// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract array from API response — handles raw arrays, paginated { data, pagination }, { positions, ... }, and { applicants, ... } shapes */
export function extractList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.positions)) return obj.positions as T[];
    if (Array.isArray(obj.applicants)) return obj.applicants as T[];
  }
  return [];
}
