/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import type { PlanId } from '../types/traits';

export const ENTITLEMENT_ID = 'Looksmaxxing Pro';

const PLATFORM_REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? '';
const TEST_STORE_REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY ?? '';
const REVENUECAT_API_KEY =
  __DEV__ && TEST_STORE_REVENUECAT_KEY ? TEST_STORE_REVENUECAT_KEY : PLATFORM_REVENUECAT_KEY;

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

type PurchasesModule = typeof import('react-native-purchases').default;

function getPurchases(): PurchasesModule | null {
  if (!isNative) return null;
  return require('react-native-purchases').default;
}

let configured = false;

export async function configurePurchases(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases) return false;
  if (configured) return true;
  if (!REVENUECAT_API_KEY) {
    console.warn('[purchases] no RevenueCat key configured — skipping configure');
    return false;
  }
  try {
    const { LOG_LEVEL } = require('react-native-purchases');
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    configured = true;
  } catch (e) {
    console.warn('[purchases] configure failed', e);
  }
  return configured;
}

export function isProActive(info: CustomerInfo | null): boolean {
  return info?.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.warn('[purchases] getCustomerInfo failed', e);
    return null;
  }
}

export interface OfferingResult {
  offering: PurchasesOffering | null;
  error: string | null;
}

export async function getCurrentOffering(): Promise<OfferingResult> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return { offering: null, error: null };
  try {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) {
      return {
        offering: null,
        error: 'No subscription plans are available for this store yet.',
      };
    }
    return { offering: offerings.current, error: null };
  } catch (e) {
    console.warn('[purchases] getOfferings failed', e);
    return {
      offering: null,
      error: "Couldn't load subscription plans. Check your connection and try again.",
    };
  }
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

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) {
    return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { pro: isProActive(customerInfo), cancelled: false, error: null };
  } catch (e) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) {
      return { pro: false, cancelled: true, error: null };
    }
    console.warn('[purchases] purchase failed', e);
    return { pro: false, cancelled: false, error: err.message ?? 'Purchase failed. Please try again.' };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) {
    return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    if (isProActive(customerInfo)) {
      return { pro: true, cancelled: false, error: null };
    }
    return {
      pro: false,
      cancelled: false,
      error: `No active subscription found for this ${Platform.OS === 'ios' ? 'Apple ID' : 'account'}.`,
    };
  } catch (e) {
    const err = e as { message?: string };
    console.warn('[purchases] restore failed', e);
    return { pro: false, cancelled: false, error: err.message ?? 'Restore failed. Please try again.' };
  }
}

export async function getAppUserID(): Promise<string> {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return '';
  try {
    return await Purchases.getAppUserID();
  } catch {
    return '';
  }
}

export function addCustomerInfoListener(cb: (info: CustomerInfo) => void): () => void {
  const Purchases = getPurchases();
  if (!Purchases || !configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(cb);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(cb);
  };
}

export async function presentRevenueCatPaywallIfNeeded(): Promise<boolean> {
  if (!isNative || !configured) return false;
  try {
    const RevenueCatUI = require('react-native-purchases-ui').default;
    const { PAYWALL_RESULT } = require('react-native-purchases-ui');
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  } catch (e) {
    console.warn('[purchases] RevenueCat paywall failed', e);
    return false;
  }
}

export async function presentCustomerCenter(): Promise<void> {
  if (!isNative || !configured) return;
  try {
    const RevenueCatUI = require('react-native-purchases-ui').default;
    await RevenueCatUI.presentCustomerCenter();
  } catch (e) {
    console.warn('[purchases] Customer Center failed', e);
  }
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
