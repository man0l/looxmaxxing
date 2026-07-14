import { test, expect } from '@playwright/test';
import { enterSubscribedApp } from './helpers/onboardingFlow';
import { APP_STORAGE_KEYS, readAppStorage, resetWebApp } from './helpers/resetWebApp';

test.describe('Delete all my data', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/user-data', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ renders: 0, entitlementCache: true, revenuecat: true }),
        });
        return;
      }
      await route.continue();
    });
    await resetWebApp(page, `e2e_delete_${Date.now()}`);
  });

  test('clears local stores and returns to onboarding', async ({ page }) => {
    await enterSubscribedApp(page);

    const before = await readAppStorage(page);
    expect(before['app-onboarded-v1']).toBeTruthy();

    await page.getByText('Profile', { exact: true }).click();
    await page.getByText('Delete all my data').scrollIntoViewIfNeeded();
    await expect(page.getByText('Delete all my data')).toBeVisible();

    await page.getByText('Delete all my data').click();
    await expect(page.getByText('Delete all your data?')).toBeVisible();
    await page.getByText('Delete all data', { exact: true }).click();

    await expect(page.getByText('All data deleted.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Get an honest read on your face')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Top \d+% of men/)).toHaveCount(0);

    const after = await readAppStorage(page);

    const onboardedRaw = after['app-onboarded-v1'];
    if (onboardedRaw) {
      expect(JSON.parse(onboardedRaw).onboarded).not.toBe(true);
    }

    const scansRaw = after['scan-store-v1'];
    if (scansRaw) {
      const scans = JSON.parse(scansRaw) as { scans: unknown[]; hasRealScan: boolean };
      expect(scans.hasRealScan).toBe(false);
      expect(scans.scans).toEqual([]);
    }

    const onboardingRaw = after['onboarding-v1'];
    if (onboardingRaw) {
      const onboarding = JSON.parse(onboardingRaw) as {
        frontPhoto: string | null;
        profilePhoto: string | null;
        concerns: string[];
      };
      expect(onboarding.frontPhoto).toBeNull();
      expect(onboarding.profilePhoto).toBeNull();
      expect(onboarding.concerns).toEqual([]);
    }
  });
});