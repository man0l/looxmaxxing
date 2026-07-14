import type { Page } from '@playwright/test';

const STORAGE_KEYS = [
  'scan-store-v1',
  'practice-v1',
  'streak-v1',
  'onboarding-v1',
  'app-onboarded-v1',
  'render-cache-v1',
];

export async function resetWebApp(page: Page, userId: string) {
  await page.addInitScript(
    ([id, keys]) => {
      sessionStorage.setItem('e2e_app_user_id', id);
      localStorage.clear();
      for (const key of keys) localStorage.removeItem(key);
    },
    [userId, STORAGE_KEYS] as const,
  );
  await page.goto('/');
  await page.reload();
}