import {
  Purchases,
  ErrorCode,
  PurchasesError,
  type Package as WebPackage,
  type Offering as WebOffering,
  type CustomerInfo as WebCustomerInfo,
} from '@revenuecat/purchases-js';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import type { PlanId } from '../types/traits';
import { e2eAppUserId, resolveE2eAppUserId } from '../config/e2e';

export const ENTITLEMENT_ID = 'Looksmaxxing Pro';

const PLATFORM_REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? '';
const TEST_STORE_REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY ?? '';
const REVENUECAT_API_KEY =
  __DEV__ && TEST_STORE_REVENUECAT_KEY ? TEST_STORE_REVENUECAT_KEY : PLATFORM_REVENUECAT_KEY;

type ShimPackage = PurchasesPackage & { __webPkg?: WebPackage };

let configured = false;
let currentAppUserId = '';
const webPackageByShim = new WeakMap<PurchasesPackage, WebPackage>();

function purchaseHtmlTarget(): HTMLElement {
  const existing = document.getElementById('rcb-ui-root');
  if (existing) return existing;
  const root = document.createElement('div');
  root.id = 'rcb-ui-root';
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.zIndex = '99999';
  document.body.appendChild(root);
  return root;
}

function clearPurchaseOverlay(): void {
  const root = document.getElementById('rcb-ui-root');
  if (!root) return;
  root.replaceChildren();
  root.remove();
}

function mapPackageType(webType: string): string {
  if (webType === '$rc_weekly') return 'WEEKLY';
  if (webType === '$rc_annual') return 'ANNUAL';
  if (webType === '$rc_monthly') return 'MONTHLY';
  if (webType === '$rc_lifetime') return 'LIFETIME';
  return 'CUSTOM';
}

function shimPackage(webPkg: WebPackage): PurchasesPackage {
  const price = webPkg.webBillingProduct.currentPrice;
  const shim = {
    identifier: webPkg.identifier,
    packageType: mapPackageType(webPkg.packageType),
    product: {
      identifier: webPkg.webBillingProduct.identifier,
      priceString: price.formattedPrice,
      price: price.amountMicros / 1_000_000,
      currencyCode: price.currency,
    },
    __webPkg: webPkg,
  } as ShimPackage;
  webPackageByShim.set(shim, webPkg);
  return shim;
}

function resolveWebPackage(pkg: PurchasesPackage): WebPackage | null {
  const direct = (pkg as ShimPackage).__webPkg;
  if (direct) return direct;
  return webPackageByShim.get(pkg) ?? null;
}

function shimOffering(webOffering: WebOffering): PurchasesOffering {
  return {
    identifier: webOffering.identifier,
    serverDescription: webOffering.serverDescription,
    availablePackages: webOffering.availablePackages.map(shimPackage),
    lifetime: webOffering.lifetime ? shimPackage(webOffering.lifetime) : null,
    annual: webOffering.annual ? shimPackage(webOffering.annual) : null,
    sixMonth: webOffering.sixMonth ? shimPackage(webOffering.sixMonth) : null,
    threeMonth: webOffering.threeMonth ? shimPackage(webOffering.threeMonth) : null,
    twoMonth: webOffering.twoMonth ? shimPackage(webOffering.twoMonth) : null,
    monthly: webOffering.monthly ? shimPackage(webOffering.monthly) : null,
    weekly: webOffering.weekly ? shimPackage(webOffering.weekly) : null,
  } as PurchasesOffering;
}

function asCustomerInfo(info: WebCustomerInfo): CustomerInfo {
  return info as unknown as CustomerInfo;
}

export async function configurePurchases(): Promise<boolean> {
  if (configured) return true;
  if (!REVENUECAT_API_KEY) {
    console.warn('[purchases.web] no RevenueCat key configured');
    return false;
  }
  try {
    currentAppUserId =
      resolveE2eAppUserId() || Purchases.generateRevenueCatAnonymousAppUserId();
    Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserId: currentAppUserId });
    configured = true;
  } catch (e) {
    console.warn('[purchases.web] configure failed', e);
  }
  return configured;
}

export function isProActive(info: CustomerInfo | null): boolean {
  return info?.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    const info = await Purchases.getSharedInstance().getCustomerInfo();
    return asCustomerInfo(info);
  } catch (e) {
    console.warn('[purchases.web] getCustomerInfo failed', e);
    return null;
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();
    return offerings.current ? shimOffering(offerings.current) : null;
  } catch (e) {
    console.warn('[purchases.web] getOfferings failed', e);
    return null;
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
  if (!configured) {
    return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
  }
  const webPkg = resolveWebPackage(pkg);
  if (!webPkg) {
    return { pro: false, cancelled: false, error: 'Package mapping lost — reload and try again.' };
  }
  try {
    const result = await Purchases.getSharedInstance().purchase({
      rcPackage: webPkg,
      htmlTarget: purchaseHtmlTarget(),
    });
    clearPurchaseOverlay();
    return { pro: isProActive(asCustomerInfo(result.customerInfo)), cancelled: false, error: null };
  } catch (e) {
    clearPurchaseOverlay();
    if (e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
      return { pro: false, cancelled: true, error: null };
    }
    const message = e instanceof Error ? e.message : 'Purchase failed. Please try again.';
    console.warn('[purchases.web] purchase failed', e);
    return { pro: false, cancelled: false, error: message };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!configured) {
    return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
  }
  try {
    const info = await Purchases.getSharedInstance().getCustomerInfo();
    if (isProActive(asCustomerInfo(info))) {
      return { pro: true, cancelled: false, error: null };
    }
    return { pro: false, cancelled: false, error: 'No active subscription found to restore.' };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Restore failed. Please try again.';
    console.warn('[purchases.web] restore failed', e);
    return { pro: false, cancelled: false, error: message };
  }
}

export async function getAppUserID(): Promise<string> {
  if (!configured) return e2eAppUserId;
  try {
    return Purchases.getSharedInstance().getAppUserId();
  } catch {
    return currentAppUserId || e2eAppUserId;
  }
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