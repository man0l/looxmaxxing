import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import type { PlanId } from '../types/traits';

export const ENTITLEMENT_ID = 'Looksmaxxing Pro';

export async function configurePurchases(): Promise<boolean> {
  return false;
}

export function isProActive(info: CustomerInfo | null): boolean {
  return info?.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  return null;
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  return null;
}

const PLAN_PACKAGE_TYPE: Record<PlanId, string> = {
  weekly: 'WEEKLY',
  annual: 'ANNUAL',
};

export function packageForPlan(
  offering: PurchasesOffering,
  plan: PlanId,
): PurchasesPackage | null {
  return (
    offering.availablePackages.find(
      (pkg) => (pkg.packageType as string) === PLAN_PACKAGE_TYPE[plan],
    ) ?? null
  );
}

export interface PurchaseResult {
  pro: boolean;
  cancelled: boolean;
  error: string | null;
}

export async function purchasePackage(_pkg: PurchasesPackage): Promise<PurchaseResult> {
  return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
}

export async function restorePurchases(): Promise<PurchaseResult> {
  return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
}

export function addCustomerInfoListener(_cb: (info: CustomerInfo) => void): () => void {
  return () => {};
}

export async function presentRevenueCatPaywallIfNeeded(): Promise<boolean> {
  return false;
}

export async function presentCustomerCenter(): Promise<void> {
  return;
}

export function perWeekLabel(pkg: PurchasesPackage): string | null {
  try {
    const perWeek = pkg.product.price / 52;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: pkg.product.currencyCode,
    }).format(perWeek);
  } catch {
    return null;
  }
}
