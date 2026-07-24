import { test, expect } from '@playwright/test';
import { enterSubscribedApp } from './helpers/onboardingFlow';
import { resetWebApp } from './helpers/resetWebApp';

test.describe('LooxMaxxing web funnel', () => {
  test.beforeEach(async ({ page }) => {
    await resetWebApp(page, `e2e_stub_${Date.now()}`);
  });

  test('onboarding → paywall subscribe → scan → avatars render', async ({ page }) => {
    await enterSubscribedApp(page);

    await page.getByText('Avatars', { exact: true }).click();
    await expect(page.getByText('Your goals')).toBeVisible();

    await page.getByText('A sharper jawline').click();
    await expect(page.getByText('styling preview')).toBeVisible();
    await expect(page.locator('img[src*="placehold.co"]')).toBeVisible({ timeout: 30_000 });

    // Nested screens use plain "‹ Back" (not parent-tab breadcrumbs).
    await page.getByText('‹ Back', { exact: true }).click();
    await expect(page.locator('img[src*="placehold.co"]').first()).toBeVisible();
  });
});