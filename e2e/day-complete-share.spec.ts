import { test, expect } from '@playwright/test';
import { enterSubscribedApp } from './helpers/onboardingFlow';
import { resetWebApp } from './helpers/resetWebApp';

test.describe('Day complete moment', () => {
  test.beforeEach(async ({ page }) => {
    await resetWebApp(page, `e2e_day_complete_${Date.now()}`);
  });

  test('last plan task shows completion overlay and opens share sheet', async ({ page }) => {
    await enterSubscribedApp(page);

    await page.getByText('Practice', { exact: true }).click();
    await expect(page.getByText('Your plan', { exact: true })).toBeVisible();
    await page.getByText('Jawline workout', { exact: true }).click();
    await expect(page.getByText('Mark session complete')).toBeVisible();

    await page.getByText('Mark session complete').click();

    const moment = page
      .locator('div')
      .filter({ hasText: 'All done for today' })
      .filter({ hasText: 'Continue' })
      .last();
    await expect(moment).toBeVisible({ timeout: 10_000 });
    await expect(moment.getByText(/^Day \d+$/)).toBeVisible();
    await expect(moment.getByText('Your streak is still growing.')).toBeVisible();

    await moment.getByText('Share results', { exact: true }).click();

    await expect(page.getByText('Stories', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('More', { exact: true })).toBeVisible();
  });
});