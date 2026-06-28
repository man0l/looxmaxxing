import { test, expect } from '@playwright/test';

const API_HOST = 'looxmaxxing-api.vercel.app';

test.describe('LooxMaxxing live API web funnel', () => {
  test.beforeEach(async ({ page }) => {
    const userId = `e2e_web_${Date.now()}`;
    await page.addInitScript((id) => {
      sessionStorage.setItem('e2e_app_user_id', id);
      localStorage.clear();
    }, userId);
    await page.goto('/');
    await page.reload();
  });

  test('purchase → real scan API → real avatar render API', async ({ page }) => {
    const apiCalls: { method: string; url: string; status: number }[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (!url.includes(API_HOST)) return;
      apiCalls.push({ method: res.request().method(), url, status: res.status() });
    });

    await expect(page.getByText('How old are you?')).toBeVisible();
    await page.getByText('25–34').click();
    await page.getByText('Continue', { exact: true }).click();
    await page.getByText(/Let.s start/i).click();
    await page.getByText('Sharper jawline').click();
    await page.getByText('Continue', { exact: true }).click();
    await page.getByText('Skip').click();
    await page.getByText('Got it', { exact: true }).click();

    await expect(page.getByText('Front photo first')).toBeVisible();
    await page.getByTestId('e2e-use-test-photo').click();
    await expect(page.getByText('Now your profile')).toBeVisible();
    await page.getByTestId('e2e-use-test-photo').click();

    await expect(page.getByText(/analysis is ready/i)).toBeVisible();
    await expect(page.getByTestId('paywall-unlock')).toContainText('Unlock my results', { timeout: 60_000 });
    await page.getByTestId('paywall-unlock').click();

    const testPurchase = page.getByRole('button', { name: 'Test valid purchase' });
    await expect(testPurchase).toBeVisible({ timeout: 30_000 });
    await testPurchase.click();

    await expect(page.getByText('Analyzing your photos')).toBeVisible();
    await expect(page.getByText(/Top \d+% of men/)).toBeVisible({ timeout: 120_000 });

    const scanUpload = apiCalls.find((c) => c.url.includes('/v1/scans/uploads'));
    const scanScore = apiCalls.find((c) => c.url.match(/\/v1\/scans(\?|$)/) && c.method === 'POST');
    expect(scanUpload?.status, `scan uploads: ${JSON.stringify(apiCalls)}`).toBe(200);
    expect([200, 201], `scan score: ${JSON.stringify(apiCalls)}`).toContain(scanScore?.status);

    await page.getByText('Avatars', { exact: true }).click();
    await expect(page.getByText('Preview your potential')).toBeVisible();
    await page.getByText('A sharper jawline').click();
    await expect(page.getByText('styling preview')).toBeVisible();

    await expect
      .poll(
        () => {
          const renderStart = apiCalls.find(
            (c) => c.url.includes('/v1/renders') && c.method === 'POST' && !c.url.includes('uploads'),
          );
          return renderStart?.status === 200 || renderStart?.status === 202;
        },
        { timeout: 120_000 },
      )
      .toBe(true);

    await expect(page.locator('img').filter({ hasNot: page.locator('[src*="placehold.co"]') }).first()).toBeVisible({
      timeout: 120_000,
    });
  });
});