import type { Entitlement, Plan } from '../../lib/entitlement';

export interface PlanOffer {
  plan: Plan;
  price: string; // localized store price, e.g. "$9.99"
  period: 'month' | 'year';
}

export interface PurchaseResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
  entitlement: Entitlement;
}

/** Everything the UI needs from a store. RevenueCat on devices, MockPayments elsewhere. */
export interface Payments {
  readonly kind: 'mock' | 'revenuecat';
  init(): Promise<void>;
  getEntitlement(): Promise<Entitlement>;
  getOffers(): Promise<PlanOffer[]>;
  purchase(plan: Plan): Promise<PurchaseResult>;
  restore(): Promise<Entitlement>;
  /** Opens the store's subscription management. */
  manage(): Promise<void>;
}
