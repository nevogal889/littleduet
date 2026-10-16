import type { Payments } from './types';

/** Web: no store. MockPayments is used instead (see ./index.ts). */
export function createStorePayments(): Payments | null {
  return null;
}
