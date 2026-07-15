import { expect, type Page } from '@playwright/test';

export async function runOnboardingToPaywall(page: Page) {
  await expect(page.getByText('Get an honest read on your face')).toBeVisible();
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

  await expect(page.getByText('Most guys land between 4 and 7')).toBeVisible();
  await page.getByText('Got it', { exact: true }).click();

  await expect(page.getByText('When do you want to see your first results?')).toBeVisible();
  await page.getByText('In 1 month').click();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText('How far do you want to go?')).toBeVisible();
  await page.getByText('A noticeable step up').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText("I'm in — let's go").click();

  await expect(page.getByText('Front photo first')).toBeVisible();
  await page.getByTestId('e2e-use-test-photo').click();

  await expect(page.getByText('Now your profile')).toBeVisible();
  await page.getByTestId('e2e-use-test-photo').click();

  await expect(page.getByText('Analyzing Your Face')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('This app changed my life')).toBeVisible({ timeout: 15_000 });
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText('Share your progress, your way')).toBeVisible();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page.getByText(/analysis is ready/i)).toBeVisible();
}

export async function unlockPaywall(page: Page) {
  const unlock = page.getByTestId('paywall-unlock');
  await expect(unlock).toBeVisible({ timeout: 60_000 });
  await expect(unlock).toBeEnabled();
  await unlock.click();

  const testPurchase = page.getByRole('button', { name: 'Test valid purchase' });
  await expect(testPurchase).toBeVisible({ timeout: 30_000 });
  await testPurchase.click();
}

/** Results redesign shows Overall + per-trait "Top X% of men" — match any. */
export async function expectResultsUnlocked(page: Page, timeout = 90_000) {
  await expect(page.getByText(/Top \d+% of men/).first()).toBeVisible({ timeout });
}

export async function enterSubscribedApp(page: Page) {
  await runOnboardingToPaywall(page);
  await unlockPaywall(page);
  await expectResultsUnlocked(page);
}