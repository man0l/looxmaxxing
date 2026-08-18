import { test, expect } from '@playwright/test';
import { runOnboardingToPaywall } from './helpers/onboardingFlow';

test('locked results shows 0-10 scores and no raw percentages', async ({ page }) => {
  await page.goto('/');
  await runOnboardingToPaywall(page);

  await page.getByText('Maybe later').click();

  await expect(page.getByText('Your scores are waiting')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Progress', { exact: true })).toBeVisible();
  await expect(page.getByText(/^\d+%$/)).toHaveCount(0);
  await page.screenshot({ path: 'test-results/locked-results.png', fullPage: true });
});
