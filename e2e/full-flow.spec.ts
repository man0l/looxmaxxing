import { test, expect } from '@playwright/test';

test.describe('LooxMaxxing web funnel', () => {
  test.beforeEach(async ({ page }) => {
    const userId = `e2e_stub_${Date.now()}`;
    await page.addInitScript((id) => {
      sessionStorage.setItem('e2e_app_user_id', id);
      localStorage.clear();
    }, userId);
    await page.goto('/');
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

    const paywallTease = page.getByText(/analysis is ready/i);
    if (await paywallTease.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await expect(page.getByTestId('paywall-unlock')).toContainText('Unlock my results', { timeout: 60_000 });
      await page.getByTestId('paywall-unlock').click();

      const testPurchase = page.getByRole('button', { name: 'Test valid purchase' });
      await expect(testPurchase).toBeVisible({ timeout: 30_000 });
      await testPurchase.click();

      await expect(page.getByText(/analysis is ready/i)).not.toBeVisible({ timeout: 60_000 });
    }
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