import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PurchasesOffering } from 'react-native-purchases';
import type { PlanId } from '../types/traits';
import { useToast } from './ToastContext';
import { isE2E } from '../config/e2e';
import {
  addCustomerInfoListener,
  configurePurchases,
  getCurrentOffering,
  getCustomerInfo,
  isProActive,
  packageForPlan,
  purchasePackage,
  restorePurchases,
} from '../services/purchases';

interface SubscriptionValue {
  subscribed: boolean;
  paywallVisible: boolean;
  purchasing: boolean;
  purchaseError: string | null;
  offering: PurchasesOffering | null;
  subscribe: (plan: PlanId) => Promise<void>;
  restore: () => Promise<void>;
  openPaywall: () => void;
  dismissPaywall: () => void;
}

const SubscriptionContext = createContext<SubscriptionValue>({
  subscribed: false,
  paywallVisible: false,
  purchasing: false,
  purchaseError: null,
  offering: null,
  subscribe: async () => {},
  restore: async () => {},
  openPaywall: () => {},
  dismissPaywall: () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const ok = await configurePurchases();
      if (!ok || cancelled) return;
      const [info, currentOffering] = await Promise.all([
        getCustomerInfo(),
        getCurrentOffering(),
      ]);
      if (cancelled) return;
      setSubscribed(isProActive(info));
      setOffering(currentOffering);
      unsubscribe = addCustomerInfoListener((updated) => {
        setSubscribed(isProActive(updated));
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const subscribe = useCallback(
    async (plan: PlanId) => {
      setPurchaseError(null);
      let activeOffering = offering;
      if (!activeOffering) {
        activeOffering = await getCurrentOffering();
        if (activeOffering) setOffering(activeOffering);
      }
      const pkg = activeOffering ? packageForPlan(activeOffering, plan) : null;
      if (!pkg) {
        if (__DEV__ && !isE2E) {
          setSubscribed(true);
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
        setSubscribed(true);
        setPaywallVisible(false);
        showToast("You're in — welcome to Pro.", 'success');
        return;
      }

      setPurchasing(true);
      try {
        const result = await purchasePackage(pkg);
        if (result.pro) {
          setSubscribed(true);
          setPaywallVisible(false);
          showToast("You're in — welcome to Pro.", 'success');
        } else if (!result.cancelled && result.error) {
          setPurchaseError(result.error);
          showToast(result.error, 'error');
        }
      } finally {
        setPurchasing(false);
      }
    },
    [offering, showToast],
  );

  const restore = useCallback(async () => {
    setPurchaseError(null);
    setPurchasing(true);
    let result = { pro: false, cancelled: false, error: null as string | null };
    try {
      result = await restorePurchases();
    } finally {
      setPurchasing(false);
    }
    if (result.pro) {
      setSubscribed(true);
      setPaywallVisible(false);
      showToast('Purchases restored.', 'success');
    } else if (result.error) {
      setPurchaseError(result.error);
      showToast(result.error, 'error');
    } else {
      showToast('No active subscription found to restore.', 'info');
    }
  }, [showToast]);

  const openPaywall = useCallback(() => {
    setPurchaseError(null);
    setPaywallVisible(true);
  }, []);
  const dismissPaywall = useCallback(() => setPaywallVisible(false), []);

  const value = useMemo(
    () => ({
      subscribed,
      paywallVisible,
      purchasing,
      purchaseError,
      offering,
      subscribe,
      restore,
      openPaywall,
      dismissPaywall,
    }),
    [
      subscribed,
      paywallVisible,
      purchasing,
      purchaseError,
      offering,
      subscribe,
      restore,
      openPaywall,
      dismissPaywall,
    ],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
