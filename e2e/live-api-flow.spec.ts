import { test, expect } from '@playwright/test';
import {
  expectResultsUnlocked,
  runOnboardingToPaywall,
  unlockPaywall,
} from './helpers/onboardingFlow';
import { resetWebApp } from './helpers/resetWebApp';

const API_HOST = 'looxmaxxing-api.vercel.app';

test.describe('LooxMaxxing live API web funnel', () => {
  test.beforeEach(async ({ page }) => {
    await resetWebApp(page, `e2e_web_${Date.now()}`);
  });

  test('purchase → real scan API → real avatar render API', async ({ page }) => {
    const apiCalls: { method: string; url: string; status: number }[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (!url.includes(API_HOST)) return;
      apiCalls.push({ method: res.request().method(), url, status: res.status() });
    });

    await runOnboardingToPaywall(page);
    await unlockPaywall(page);

    await expect(page.getByText('Analyzing your photos')).toBeVisible();
    await expectResultsUnlocked(page, 120_000);

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