import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  scans: 'scan-store-v1',
  practice: 'practice-v1',
  streak: 'streak-v1',
  onboarding: 'onboarding-v1',
  onboarded: 'app-onboarded-v1',
  /** Last-known Pro entitlement — avoids unlock→Pro flash on cold start. */
  entitlement: 'entitlement-v1',
} as const;

export async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / offline */
  }
}

const RENDER_CACHE_KEY = 'render-cache-v1';

export async function clearAllAppData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([...Object.values(STORAGE_KEYS), RENDER_CACHE_KEY]);
  } catch {
    /* offline / quota */
  }
}