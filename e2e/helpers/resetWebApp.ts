import type { Page } from '@playwright/test';

export const APP_STORAGE_KEYS = [
  'scan-store-v1',
  'practice-v1',
  'streak-v1',
  'onboarding-v1',
  'app-onboarded-v1',
  'render-cache-v1',
] as const;

export async function resetWebApp(page: Page, userId: string) {
  await page.addInitScript(
    ([id, keys]) => {
      sessionStorage.setItem('e2e_app_user_id', id);
      localStorage.clear();
      for (const key of keys) localStorage.removeItem(key);
    },
    [userId, APP_STORAGE_KEYS] as const,
  );
  await page.goto('/');
  await page.reload();
}

export async function readAppStorage(page: Page): Promise<Record<string, string | null>> {
  return page.evaluate((keys) => {
    const out: Record<string, string | null> = {};
    for (const key of keys) out[key] = localStorage.getItem(key);
    return out;
  }, [...APP_STORAGE_KEYS]);
}