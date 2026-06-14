import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário de composição de classes Tailwind.
 * Resolve conflitos (ex.: "p-2 p-4" → "p-4") e condicionais (clsx).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
