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
import { isE2E, e2eAppUserId, resolveE2eAppUserId } from '../config/e2e';

export const ENTITLEMENT_ID = 'Looksmaxxing Pro';

const PLATFORM_REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? '';
const TEST_STORE_REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY ?? '';
const REVENUECAT_API_KEY =
  __DEV__ && TEST_STORE_REVENUECAT_KEY ? TEST_STORE_REVENUECAT_KEY : PLATFORM_REVENUECAT_KEY;

// Web-only, and only when the Playwright suite runs without RevenueCat
// credentials: the funnel specs need to get past the paywall to reach the
// screens they actually assert on. With a key present the real Web Billing
// sandbox is used exactly as before, so CI with secrets still exercises the
// genuine purchase path. This file is never bundled into the iOS or Android
// binary — native builds use purchases.ts.
const useStubBilling = isE2E && !REVENUECAT_API_KEY;

const STUB_OFFERING = {
  identifier: 'e2e-stub',
  serverDescription: 'E2E stub offering',
  availablePackages: [
    {
      identifier: '$rc_weekly',
      packageType: 'WEEKLY',
      product: {
        identifier: 'e2e_weekly',
        priceString: '$6.99',
        price: 6.99,
        currencyCode: 'USD',
      },
    },
    {
      identifier: '$rc_annual',
      packageType: 'ANNUAL',
      product: {
        identifier: 'e2e_annual',
        priceString: '$59.99',
        price: 59.99,
        currencyCode: 'USD',
      },
    },
  ],
  lifetime: null,
  sixMonth: null,
  threeMonth: null,
  twoMonth: null,
  monthly: null,
} as unknown as PurchasesOffering;

let stubPro = false;

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
  if (useStubBilling) {
    currentAppUserId = resolveE2eAppUserId() || 'e2e-stub-user';
    configured = true;
    return true;
  }
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
  if (useStubBilling) return stubCustomerInfo();
  if (!configured) return null;
  try {
    const info = await Purchases.getSharedInstance().getCustomerInfo();
    return asCustomerInfo(info);
  } catch (e) {
    console.warn('[purchases.web] getCustomerInfo failed', e);
    return null;
  }
}

export interface OfferingResult {
  offering: PurchasesOffering | null;
  error: string | null;
}

export async function getCurrentOffering(): Promise<OfferingResult> {
  if (useStubBilling) return { offering: STUB_OFFERING, error: null };
  if (!configured) return { offering: null, error: null };
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();
    if (!offerings.current) {
      return {
        offering: null,
        error: 'No subscription plans are available for this store yet.',
      };
    }
    return { offering: shimOffering(offerings.current), error: null };
  } catch (e) {
    console.warn('[purchases.web] getOfferings failed', e);
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

let billingInFlight = false;

const BILLING_BUSY: PurchaseResult = { pro: false, cancelled: true, error: null };

async function withBillingGuard(run: () => Promise<PurchaseResult>): Promise<PurchaseResult> {
  if (billingInFlight) return BILLING_BUSY;
  billingInFlight = true;
  try {
    return await run();
  } finally {
    billingInFlight = false;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  return withBillingGuard(async () => {
    if (useStubBilling) {
      stubPro = true;
      return { pro: true, cancelled: false, error: null };
    }
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
  });
}

export async function restorePurchases(): Promise<PurchaseResult> {
  return withBillingGuard(async () => {
    if (useStubBilling) {
      return stubPro
        ? { pro: true, cancelled: false, error: null }
        : { pro: false, cancelled: false, error: 'No active subscription found for this account.' };
    }
    if (!configured) {
      return { pro: false, cancelled: false, error: 'Purchases are not available on this platform.' };
    }
    try {
      const info = await Purchases.getSharedInstance().getCustomerInfo();
      if (isProActive(asCustomerInfo(info))) {
        return { pro: true, cancelled: false, error: null };
      }
      return { pro: false, cancelled: false, error: 'No active subscription found for this account.' };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Restore failed. Please try again.';
      console.warn('[purchases.web] restore failed', e);
      return { pro: false, cancelled: false, error: message };
    }
  });
}

function stubCustomerInfo(): CustomerInfo {
  return {
    entitlements: { active: stubPro ? { [ENTITLEMENT_ID]: { isActive: true } } : {} },
  } as unknown as CustomerInfo;
}

export async function getAppUserID(): Promise<string> {
  if (useStubBilling) return currentAppUserId || resolveE2eAppUserId() || 'e2e-stub-user';
  if (!configured) return e2eAppUserId;
  try {
    return Purchases.getSharedInstance().getAppUserId();
  } catch {
    return currentAppUserId || e2eAppUserId;
  }
}

export async function logOutPurchases(): Promise<void> {
  if (useStubBilling) {
    stubPro = false;
    currentAppUserId = '';
    configured = false;
    return;
  }
  if (!configured) return;
  try {
    currentAppUserId = '';
    configured = false;
  } catch (e) {
    console.warn('[purchases.web] logOut failed', e);
  }
}

export function addCustomerInfoListener(_cb: (info: CustomerInfo) => void): () => void {
  return () => {};
}

export async function presentRevenueCatPaywallIfNeeded(): Promise<boolean> {
  return false;
}

export async function presentCustomerCenter(): Promise<void> {
  // RevenueCat Customer Center is native-only. On web, send Pro users to
  // the store subscription pages so Profile still offers a manage path.
  const apple = 'https://apps.apple.com/account/subscriptions';
  const play = 'https://play.google.com/store/account/subscriptions';
  if (typeof window !== 'undefined') {
    window.open(apple, '_blank', 'noopener,noreferrer');
    return;
  }
  void play;
}

export function perWeekLabel(pkg: PurchasesPackage): string | null {
  try {
    const perWeek = pkg.product.price / 52;
    const formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: pkg.product.currencyCode,
    }).format(perWeek);
    return `${formatted} / week`;
  } catch {
    return null;
  }
}

export function formatMoney(amount: number, currencyCode: string): string | null {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return null;
  }
}