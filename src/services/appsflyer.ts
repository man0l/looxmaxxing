/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';

const DEV_KEY = process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY ?? '';
const IOS_APP_ID = process.env.EXPO_PUBLIC_APPSFLYER_APP_ID ?? '';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

type AppsFlyerModule = typeof import('react-native-appsflyer').default;

function getAppsFlyer(): AppsFlyerModule | null {
  if (!isNative) return null;
  try {
    return require('react-native-appsflyer').default;
  } catch {
    return null;
  }
}

let initialized = false;

export async function initAppsFlyer(): Promise<boolean> {
  const appsFlyer = getAppsFlyer();
  if (!appsFlyer) return false;
  if (initialized) return true;
  if (!DEV_KEY) {
    console.warn('[appsflyer] no dev key configured — skipping init');
    return false;
  }
  if (Platform.OS === 'ios' && !IOS_APP_ID) {
    console.warn('[appsflyer] no iOS app ID configured — skipping init on iOS');
    return false;
  }

  return new Promise((resolve) => {
    appsFlyer.onInstallConversionData(() => {});
    appsFlyer.initSdk(
      {
        devKey: DEV_KEY,
        isDebug: __DEV__,
        appId: Platform.OS === 'ios' ? IOS_APP_ID : undefined,
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: Platform.OS === 'ios' ? 10 : undefined,
      },
      () => {
        initialized = true;
        resolve(true);
      },
      (err: unknown) => {
        console.warn('[appsflyer] initSdk failed', err);
        resolve(false);
      },
    );
  });
}

export function setAppsFlyerCustomerUserId(userId: string): void {
  const appsFlyer = getAppsFlyer();
  if (!appsFlyer || !initialized || !userId) return;
  try {
    appsFlyer.setCustomerUserId(userId);
  } catch (e) {
    console.warn('[appsflyer] setCustomerUserId failed', e);
  }
}

export async function logAppsFlyerEvent(
  eventName: string,
  eventValues: Record<string, unknown> = {},
): Promise<void> {
  const appsFlyer = getAppsFlyer();
  if (!appsFlyer || !initialized) return;
  try {
    await appsFlyer.logEvent(eventName, eventValues);
  } catch (e) {
    console.warn('[appsflyer] logEvent failed', e);
  }
}
