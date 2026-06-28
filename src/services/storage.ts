import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  scans: 'scan-store-v1',
  practice: 'practice-v1',
  streak: 'streak-v1',
  onboarding: 'onboarding-v1',
  onboarded: 'app-onboarded-v1',
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