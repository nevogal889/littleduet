import { Linking, Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { config } from '../../config';
import { FREE_ENTITLEMENT, type Entitlement, type Plan } from '../../lib/entitlement';
import type { Payments, PlanOffer, PurchaseResult } from './types';

function toEntitlement(info: CustomerInfo): Entitlement {
  const e = info.entitlements.active[config.revenueCatEntitlement];
  if (!e) return FREE_ENTITLEMENT;
  return {
    active: true,
    trial: e.periodType === 'TRIAL',
    plan: /year|annual/i.test(e.productIdentifier) ? 'yearly' : 'monthly',
    expiresAt: e.expirationDate ? new Date(e.expirationDate).getTime() : undefined,
    source: 'revenuecat',
  };
}

class RevenueCatPayments implements Payments {
  readonly kind = 'revenuecat' as const;
  private packages: Partial<Record<Plan, PurchasesPackage>> = {};
  constructor(private apiKey: string) {}

  async init() {
    Purchases.configure({ apiKey: this.apiKey });
  }
  async getEntitlement() {
    return toEntitlement(await Purchases.getCustomerInfo());
  }
  async getOffers(): Promise<PlanOffer[]> {
    const offerings = await Purchases.getOfferings();
    const cur = offerings.current;
    const out: PlanOffer[] = [];
    if (cur?.annual) {
      this.packages.yearly = cur.annual;
      out.push({ plan: 'yearly', price: cur.annual.product.priceString, period: 'year' });
    }
    if (cur?.monthly) {
      this.packages.monthly = cur.monthly;
      out.push({ plan: 'monthly', price: cur.monthly.product.priceString, period: 'month' });
    }
    return out;
  }
  async purchase(plan: Plan): Promise<PurchaseResult> {
    try {
      if (!this.packages[plan]) await this.getOffers();
      const pkg = this.packages[plan];
      if (!pkg) return { ok: false, error: 'This plan is not available right now.', entitlement: FREE_ENTITLEMENT };
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const ent = toEntitlement(customerInfo);
      return { ok: ent.active, entitlement: ent };
    } catch (e: any) {
      if (e?.userCancelled) return { ok: false, cancelled: true, entitlement: await this.getEntitlement() };
      return { ok: false, error: 'The purchase did not go through. Please try again.', entitlement: await this.getEntitlement() };
    }
  }
  async restore() {
    return toEntitlement(await Purchases.restorePurchases());
  }
  async manage() {
    if (Platform.OS === 'ios') {
      try {
        await Purchases.showManageSubscriptions();
        return;
      } catch {}
    }
    const info = await Purchases.getCustomerInfo();
    await Linking.openURL(info.managementURL ?? (Platform.OS === 'ios' ? config.links.manageIos : config.links.manageAndroid));
  }
}

export function createStorePayments(): Payments | null {
  const key = Platform.OS === 'ios' ? config.revenueCatIosKey : config.revenueCatAndroidKey;
  return key ? new RevenueCatPayments(key) : null;
}
