import { test, expect } from '@playwright/test';
import { runOnboardingToPaywall, unlockPaywall } from './helpers/onboardingFlow';
import { resetWebApp } from './helpers/resetWebApp';

test.describe('LooxMaxxing web funnel', () => {
  test.beforeEach(async ({ page }) => {
    await resetWebApp(page, `e2e_stub_${Date.now()}`);
  });

  test('onboarding → paywall subscribe → scan → avatars render', async ({ page }) => {
    await runOnboardingToPaywall(page);
    await unlockPaywall(page);

    await expect(page.getByText(/Top \d+% of men/)).toBeVisible({ timeout: 90_000 });

    await page.getByText('Avatars', { exact: true }).click();
    await expect(page.getByText('Preview your potential')).toBeVisible();

    await page.getByText('A sharper jawline').click();
    await expect(page.getByText('styling preview')).toBeVisible();
    await expect(page.locator('img[src*="placehold.co"]')).toBeVisible({ timeout: 30_000 });

    await page.getByText('‹ Avatars').click();
    await expect(page.locator('img[src*="placehold.co"]').first()).toBeVisible();
  });
});