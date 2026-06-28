import { test, expect } from '@playwright/test';

test.describe('LooxMaxxing web funnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('onboarding → paywall subscribe → scan → avatars render', async ({ page }) => {
    await expect(page.getByText('How old are you?')).toBeVisible();

    await page.getByText('25–34').click();
    await page.getByText('Continue', { exact: true }).click();

    await expect(page.getByText('Get an honest read on your face')).toBeVisible();
    await page.getByText(/Let.s start/i).click();

    await expect(page.getByText('What would you like to work on?')).toBeVisible();
    await page.getByText('Sharper jawline').click();
    await page.getByText('Continue', { exact: true }).click();

    await page.getByText('Skip').click();

    await expect(page.getByText('Most guys land between 4 and 7')).toBeVisible();
    await page.getByText('Got it', { exact: true }).click();

    await expect(page.getByText('Front photo first')).toBeVisible();
    await page.getByTestId('e2e-use-test-photo').click();

    await expect(page.getByText('Now your profile')).toBeVisible();
    await page.getByTestId('e2e-use-test-photo').click();

    await expect(page.getByText(/analysis is ready/i)).toBeVisible();
    await page.getByTestId('paywall-unlock').click();

    await expect(page.getByText('Analyzing your photos')).toBeVisible();
    await expect(page.getByText('Top 39% of men')).toBeVisible({ timeout: 45_000 });

    await page.getByText('Avatars', { exact: true }).click();
    await expect(page.getByText('Preview your potential')).toBeVisible();

    await page.getByText('A sharper jawline').click();
    await expect(page.getByText('styling preview')).toBeVisible();
    await expect(page.locator('img[src*="placehold.co"]')).toBeVisible({ timeout: 30_000 });

    await page.getByText('‹ Avatars').click();
    await expect(page.locator('img[src*="placehold.co"]').first()).toBeVisible();
  });
});