import clsx from 'clsx';
import type { ClassValue } from 'clsx';

/**
 * Tailwind CSS 클래스 병합
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export * from './date';
export * from './price';
