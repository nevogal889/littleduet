import { MockPayments } from './mock';
import { createStorePayments } from './revenuecat';
import type { Payments } from './types';

export type { Payments, PlanOffer, PurchaseResult } from './types';

/** RevenueCat when a key is set on iOS/Android; MockPayments on web, in dev, or without keys. */
export const payments: Payments = createStorePayments() ?? new MockPayments();
