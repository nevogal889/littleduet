import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_ENTITLEMENT, PRICES, type Entitlement, type Plan } from '../../lib/entitlement';
import type { Payments, PlanOffer, PurchaseResult } from './types';

const KEY = 'littleduet:mockEntitlement';

/** Used on web, in dev, and whenever no RevenueCat key is configured. Never charges anyone. */
export class MockPayments implements Payments {
  readonly kind = 'mock' as const;
  private ent: Entitlement = FREE_ENTITLEMENT;

  async init() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) this.ent = JSON.parse(raw);
    } catch {}
  }
  async getEntitlement() {
    return this.ent;
  }
  async getOffers(): Promise<PlanOffer[]> {
    return [
      { plan: 'yearly', price: PRICES.yearly.label, period: 'year' },
      { plan: 'monthly', price: PRICES.monthly.label, period: 'month' },
    ];
  }
  async purchase(plan: Plan): Promise<PurchaseResult> {
    this.ent = { active: true, trial: true, plan, source: 'mock' };
    await this.save();
    return { ok: true, entitlement: this.ent };
  }
  async restore() {
    return this.ent;
  }
  async manage() {
    // Mock store: "managing" cancels so the free tier can be tested again.
    this.ent = FREE_ENTITLEMENT;
    await this.save();
  }
  private async save() {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(this.ent));
    } catch {}
  }
}
