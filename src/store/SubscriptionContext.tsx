import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PurchasesOffering } from 'react-native-purchases';
import type { PlanId } from '../types/traits';
import { useToast } from './ToastContext';
import { isE2E } from '../config/e2e';
import {
  addCustomerInfoListener,
  configurePurchases,
  getAppUserID,
  getCurrentOffering,
  getCustomerInfo,
  isProActive,
  packageForPlan,
  purchasePackage,
  restorePurchases,
} from '../services/purchases';
import { invalidateEntitlementCache } from '../services/api';
import { registerSubscriptionReset } from '../services/dataDeletion';
import { initAppsFlyer, setAppsFlyerCustomerUserId } from '../services/appsflyer';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

interface SubscriptionValue {
  /** False until first local cache read and/or RevenueCat hydrate finishes. */
  ready: boolean;
  subscribed: boolean;
  paywallVisible: boolean;
  purchasing: boolean;
  purchaseError: string | null;
  offering: PurchasesOffering | null;
  offeringError: string | null;
  subscribe: (plan: PlanId) => Promise<void>;
  restore: () => Promise<void>;
  reloadOffering: () => Promise<void>;
  openPaywall: () => void;
  dismissPaywall: () => void;
}

const SubscriptionContext = createContext<SubscriptionValue>({
  ready: false,
  subscribed: false,
  paywallVisible: false,
  purchasing: false,
  purchaseError: null,
  offering: null,
  offeringError: null,
  subscribe: async () => {},
  restore: async () => {},
  reloadOffering: async () => {},
  openPaywall: () => {},
  dismissPaywall: () => {},
});

async function persistEntitlement(pro: boolean): Promise<void> {
  await saveJson(STORAGE_KEYS.entitlement, { pro });
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [ready, setReady] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [offeringError, setOfferingError] = useState<string | null>(null);
  // After "delete all my data" logs the RevenueCat user out, the SDK
  // auto-resyncs the still-valid App Store receipt to the new anonymous
  // user and fires the customerInfo listener below with an active
  // entitlement — silently re-unlocking Pro without the user tapping
  // "Restore purchases", contradicting the deletion dialog's stated policy.
  // Suppress listener-driven reactivation until the user explicitly
  // subscribes or restores.
  const suppressAutoRestoreRef = useRef(false);

  const applySubscribed = useCallback((pro: boolean) => {
    setSubscribed(pro);
    void persistEntitlement(pro);
  }, []);

  useEffect(() => {
    return registerSubscriptionReset(() => {
      suppressAutoRestoreRef.current = true;
      setSubscribed(false);
      setPaywallVisible(false);
      setPurchaseError(null);
      setReady(true);
      void persistEntitlement(false);
    });
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      // Optimistic: last-known Pro from device so refresh doesn't flash locked UI.
      const cached = await loadJson<{ pro: boolean }>(STORAGE_KEYS.entitlement);
      if (cancelled) return;
      if (cached?.pro) {
        setSubscribed(true);
        setReady(true);
      }

      const ok = await configurePurchases();
      if (cancelled) return;
      if (!ok) {
        // No SDK (web stub failure etc.) — trust cache or free.
        if (!cached) setReady(true);
        return;
      }

      const [info, offeringResult] = await Promise.all([
        getCustomerInfo(),
        getCurrentOffering(),
      ]);
      if (cancelled) return;

      const pro = isProActive(info);
      applySubscribed(pro);
      setOffering(offeringResult.offering);
      setReady(true);

      initAppsFlyer().then(async (afOk) => {
        if (!afOk || cancelled) return;
        const appUserId = await getAppUserID();
        if (appUserId) setAppsFlyerCustomerUserId(appUserId);
      });
      if (offeringResult.error) {
        setOfferingError(offeringResult.error);
        showToast(offeringResult.error, 'error');
      }
      unsubscribe = addCustomerInfoListener((updated) => {
        if (suppressAutoRestoreRef.current && isProActive(updated)) return;
        applySubscribed(isProActive(updated));
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [applySubscribed, showToast]);

  const reloadOffering = useCallback(async () => {
    setOfferingError(null);
    const result = await getCurrentOffering();
    setOffering(result.offering);
    if (result.error) {
      setOfferingError(result.error);
      showToast(result.error, 'error');
    }
  }, [showToast]);

  const subscribe = useCallback(
    async (plan: PlanId) => {
      suppressAutoRestoreRef.current = false;
      setPurchaseError(null);
      let activeOffering = offering;
      if (!activeOffering) {
        activeOffering = (await getCurrentOffering()).offering;
        if (activeOffering) setOffering(activeOffering);
      }
      const pkg = activeOffering ? packageForPlan(activeOffering, plan) : null;
      if (!pkg) {
        if (__DEV__ && !isE2E) {
          applySubscribed(true);
          setPaywallVisible(false);
          showToast('Dev mode — Pro unlocked (no real purchase).', 'info');
        } else {
          const message = 'Plans are unavailable right now. Please try again later.';
          setPurchaseError(message);
          showToast(message, 'error');
        }
        return;
      }
      const existing = await getCustomerInfo();
      if (isProActive(existing)) {
        getAppUserID().then((uid) => invalidateEntitlementCache(uid)).catch(() => {});
        applySubscribed(true);
        setPaywallVisible(false);
        showToast("You're in — welcome to Pro.", 'success');
        return;
      }

      setPurchasing(true);
      try {
        const result = await purchasePackage(pkg);
        if (result.pro) {
          getAppUserID().then((uid) => invalidateEntitlementCache(uid)).catch(() => {});
          applySubscribed(true);
          setPaywallVisible(false);
          showToast("You're in — welcome to Pro.", 'success');
        } else if (result.cancelled) {
          // silent — user tapped back
        } else if (result.error) {
          setPurchaseError(result.error);
          showToast(result.error, 'error');
        } else {
          getAppUserID().then((uid) => invalidateEntitlementCache(uid)).catch(() => {});
          const refreshed = await getCustomerInfo();
          if (isProActive(refreshed)) {
            applySubscribed(true);
            setPaywallVisible(false);
            showToast("You're in — welcome to Pro.", 'success');
          } else {
            showToast('Payment received — verifying your subscription…', 'info');
          }
        }
      } finally {
        setPurchasing(false);
      }
    },
    [applySubscribed, offering, showToast],
  );

  const restore = useCallback(async () => {
    suppressAutoRestoreRef.current = false;
    setPurchaseError(null);
    setPurchasing(true);
    let result = { pro: false, cancelled: false, error: null as string | null };
    try {
      result = await restorePurchases();
    } finally {
      setPurchasing(false);
    }
    if (result.pro) {
      getAppUserID().then((uid) => invalidateEntitlementCache(uid)).catch(() => {});
      applySubscribed(true);
      setPaywallVisible(false);
      showToast('Purchases restored.', 'success');
    } else if (result.error) {
      setPurchaseError(result.error);
      showToast(result.error, 'error');
    } else {
      showToast('No active subscription found to restore.', 'info');
    }
  }, [applySubscribed, showToast]);

  const openPaywall = useCallback(() => {
    setPurchaseError(null);
    setPaywallVisible(true);
  }, []);
  const dismissPaywall = useCallback(() => setPaywallVisible(false), []);

  const value = useMemo(
    () => ({
      ready,
      subscribed,
      paywallVisible,
      purchasing,
      purchaseError,
      offering,
      offeringError,
      subscribe,
      restore,
      reloadOffering,
      openPaywall,
      dismissPaywall,
    }),
    [
      ready,
      subscribed,
      paywallVisible,
      purchasing,
      purchaseError,
      offering,
      offeringError,
      subscribe,
      restore,
      reloadOffering,
      openPaywall,
      dismissPaywall,
    ],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
