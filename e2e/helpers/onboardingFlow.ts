import { expect, type Page } from '@playwright/test';

export async function advanceToCapture(page: Page) {
  await expect(page.getByText('Build a grooming routine that sticks')).toBeVisible();
  await page.getByText('Scan my face').click();

  await expect(page.getByText('How old are you?')).toBeVisible();
  await page.getByText('25–34').click();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText('What would you like to work on?')).toBeVisible();
  await page.getByText('Sharper jawline').click();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText(/held you back/i)).toBeVisible();
  await page.getByText("Didn't know where to start").click();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText('Scores usually start between 4 and 7')).toBeVisible();
  await page.getByText('Got it', { exact: true }).click();

  await expect(page.getByText('When do you want to see your first results?')).toBeVisible();
  await page.getByText('In 1 month').click();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText('How much do you want to take on?')).toBeVisible();
  await page.getByText('Build a solid routine').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText("I'm in — let's go").click();
}

export async function advanceToAiShareConsent(page: Page) {
  await advanceToCapture(page);
  await expect(page.getByText('Front photo', { exact: true })).toBeVisible();
  await page.getByTestId('e2e-use-test-photo').click();
  await expect(page.getByText('We send your photos to OpenAI')).toBeVisible();
}

export async function runOnboardingToPaywall(page: Page) {
  await advanceToAiShareConsent(page);
  await page.getByTestId('ai-share-agree').click();

  await expect(page.getByText('Analyzing Your Face')).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Share your progress, your way')).toBeVisible({ timeout: 15_000 });
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText(/analysis is ready/i)).toBeVisible();
}

export async function unlockPaywall(page: Page) {
  const unlock = page.getByTestId('paywall-unlock');
  await expect(unlock).toBeVisible({ timeout: 60_000 });
  await expect(unlock).toBeEnabled();
  await unlock.click();

  // RevenueCat's Web Billing sandbox shows a "Test valid purchase" button. It
  // only appears when the suite runs with a RevenueCat key configured; without
  // one the app falls back to stub billing and the purchase resolves inline.
  const testPurchase = page.getByRole('button', { name: 'Test valid purchase' });
  if (await testPurchase.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await testPurchase.click();
  }
}

/**
 * Unlocked results show the user's own baseline as an "X.X / 10" score. The
 * old "Top X% of men" ranking was removed after App Review flagged ranking a
 * person against other people — do not assert on comparative copy here.
 */
export async function expectResultsUnlocked(page: Page, timeout = 90_000) {
  await expect(page.getByText(/\d\.\d \/ 10/).first()).toBeVisible({ timeout });
}

export async function enterSubscribedApp(page: Page) {
  await runOnboardingToPaywall(page);
  await unlockPaywall(page);
  await expectResultsUnlocked(page);
}