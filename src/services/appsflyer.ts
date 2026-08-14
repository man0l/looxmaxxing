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

/**
 * AppsFlyer runs WITHOUT the advertising identifier.
 *
 * The published App Privacy label declares no "Data Used to Track You", so the
 * app must not track. IDFA is disabled before init, NSPrivacyTracking is false,
 * and no ATT prompt is shown — showing one would be pointless anyway, since
 * authorization only matters if the IDFA is read.
 *
 * Install attribution still works; it just cannot use IDFA-based matching. To
 * enable tracking instead, this call must be removed AND the App Privacy label
 * must declare Device ID under "Data Used to Track You", AND an ATT prompt must
 * be shown before init. Apple cross-checks the label against the manifest.
 */
function disableAdvertisingIdentifier(appsFlyer: AppsFlyerModule): void {
  try {
    appsFlyer.disableAdvertisingIdentifier(true);
  } catch (e) {
    console.warn('[appsflyer] could not disable advertising identifier', e);
  }
}

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

  disableAdvertisingIdentifier(appsFlyer);

  return new Promise((resolve) => {
    appsFlyer.onInstallConversionData(() => {});
    appsFlyer.initSdk(
      {
        devKey: DEV_KEY,
        isDebug: __DEV__,
        appId: Platform.OS === 'ios' ? IOS_APP_ID : undefined,
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
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
