import type { LessonClass } from '../types';

export type Plan = 'monthly' | 'yearly';

export interface Entitlement {
  active: boolean;
  trial?: boolean;
  plan?: Plan;
  /** epoch ms; undefined = no known expiry (store manages renewal). */
  expiresAt?: number;
  source?: 'mock' | 'revenuecat';
}

export const FREE_ENTITLEMENT: Entitlement = { active: false };

export const PRICES = {
  monthly: { label: '$9.99', per: 'month' },
  yearly: { label: '$59.99', per: 'year', perMonth: '$5.00', save: 'Save 50%' },
  trialDays: 7,
} as const;

/** Free tier: class 1 of every song. */
export function isFreeClass(cls: Pick<LessonClass, 'index'>): boolean {
  return cls.index === 1;
}

export function isEntitled(e: Entitlement, now: number = Date.now()): boolean {
  if (!e.active) return false;
  return e.expiresAt === undefined || e.expiresAt > now;
}

export function canPlayClass(cls: Pick<LessonClass, 'index'>, e: Entitlement, now: number = Date.now()): boolean {
  return isFreeClass(cls) || isEntitled(e, now);
}
