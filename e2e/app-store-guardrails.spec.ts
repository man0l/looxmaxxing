import { test, expect } from '@playwright/test';
import {
  advanceToAiShareConsent,
  advanceToCapture,
  enterSubscribedApp,
} from './helpers/onboardingFlow';
import { resetWebApp } from './helpers/resetWebApp';

/**
 * Regression cover for the App Store rejections. Each assertion here maps to a
 * guideline the app was rejected under — if one of these fails, the build is
 * not submittable. See docs/APP_REVIEW_RESPONSE_2026-08-17.md.
 */
test.describe('App Store guardrails', () => {
  test.beforeEach(async ({ page }) => {
    await resetWebApp(page, `e2e_guardrails_${Date.now()}`);
  });

  // Guideline 5.1.1(iv) — a pre-permission screen may explain why, but must not
  // direct the user to grant access.
  test('camera pre-prompt uses a neutral CTA, never "Allow camera"', async ({ page, context }) => {
    await context.clearPermissions();
    await advanceToCapture(page);

    await expect(page.getByText('Front photo', { exact: true })).toBeVisible();
    await expect(page.getByText('Allow camera')).toHaveCount(0);
    await expect(page.getByText('Allow', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Continue', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Axend uses the camera to take the front photo your scores are read from.'),
    ).toBeVisible();
  });

  // Guideline 1.2 — the capture screen states the self-only rule the Terms
  // already require, so the app never invites scanning someone else's face.
  test('capture screen states scans are of your own face', async ({ page }) => {
    await advanceToCapture(page);
    await expect(page.getByText(/Scan your own face only/)).toBeVisible();
    await expect(page.getByText(/sent to OpenAI/)).toBeVisible();
    await expect(page.getByText(/A photo of you/)).toBeVisible();
  });

  // Guideline 5.1.1(i) / 5.1.2(i) — before sending face photos to a third-party
  // AI, the app must name the recipient, say what is sent, and get permission.
  test('AI share consent names OpenAI and is required before analyzing', async ({ page }) => {
    await advanceToAiShareConsent(page);

    await expect(page.getByTestId('ai-share-consent')).toBeVisible();
    await expect(page.getByText('We send your photos to OpenAI')).toBeVisible();
    await expect(page.getByText(/front and profile photos of your face/i)).toBeVisible();
    await expect(page.getByText('Agree and continue')).toBeVisible();
    await expect(page.getByText("Don't send")).toBeVisible();
    await expect(page.getByText('Allow camera')).toHaveCount(0);
    await expect(page.getByText('Allow', { exact: true })).toHaveCount(0);

    await page.getByTestId('ai-share-agree').click();
    await expect(page.getByText('Analyzing Your Face')).toBeVisible({ timeout: 15_000 });
  });

  test('declining AI share consent does not continue to analyzing', async ({ page }) => {
    await advanceToAiShareConsent(page);
    await page.getByTestId('ai-share-decline').click();

    await expect(page.getByText('Analyzing Your Face')).toHaveCount(0);
    await expect(page.getByText('We send your photos to OpenAI')).toHaveCount(0);
    await expect(page.getByText('Front photo', { exact: true })).toBeVisible();
  });

  test('Profile can withdraw and restore OpenAI photo sharing', async ({ page }) => {
    await enterSubscribedApp(page);

    await page.getByText('Profile', { exact: true }).click();
    await expect(page.getByTestId('ai-share-consent-row')).toBeVisible();
    await expect(page.getByTestId('ai-share-consent-row').getByText('On', { exact: true })).toBeVisible();

    await page.getByTestId('ai-share-consent-row').click();
    await expect(page.getByText('Stop sending photos to OpenAI?')).toBeVisible();
    await page.getByTestId('ai-share-withdraw').click();
    await expect(page.getByTestId('ai-share-consent-row').getByText('Off', { exact: true })).toBeVisible();

    await page.getByTestId('ai-share-consent-row').click();
    await expect(page.getByText('We send your photos to OpenAI')).toBeVisible();
    await page.getByTestId('ai-share-decline').click();
    await expect(page.getByTestId('ai-share-consent-row').getByText('Off', { exact: true })).toBeVisible();

    await page.getByTestId('ai-share-consent-row').click();
    await page.getByTestId('ai-share-agree').click();
    await expect(page.getByTestId('ai-share-consent-row').getByText('On', { exact: true })).toBeVisible();
  });

  // Guideline 1.2 — a card pairing a real face with appearance scores, shared
  // off-device, is what was rejected. The card must carry no photo.
  test('shareable score card carries no face photo', async ({ page }) => {
    await enterSubscribedApp(page);

    await page.getByLabel('Share results').click();
    await expect(page.getByText('Stories', { exact: true })).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(/My baseline/)).toBeVisible();
    await expect(page.getByText('Tracking my own progress with Axend')).toBeVisible();

    const shareSheet = page.locator('div').filter({ hasText: /Tracking my own progress/ }).last();
    await expect(shareSheet.locator('img')).toHaveCount(0);
  });

  // Guideline 2.3.6 — the age assurance mechanism has to be locatable in the
  // app, not only during first-run onboarding.
  test('Profile exposes the 17+ age declaration and can reopen the gate', async ({ page }) => {
    await enterSubscribedApp(page);

    await page.getByText('Profile', { exact: true }).click();
    await expect(page.getByText('Minimum age')).toBeVisible();
    await expect(page.getByText('17+', { exact: true })).toBeVisible();
    await expect(page.getByText('Your age range')).toBeVisible();

    await page.getByText('Change age range').click();
    await expect(page.getByText('How old are you?')).toBeVisible();
    await expect(page.getByText(/Axend is for ages 17 and up/)).toBeVisible();
    // The eligible bands start at 17 — a 17-year-old needs a truthful option.
    await expect(page.getByText('17–24', { exact: true })).toBeVisible();
  });

  // Guideline 2.3.6 — force-quitting on the ineligible screen used to drop the
  // user back at welcome with the block forgotten.
  test('an under-17 declaration survives a relaunch', async ({ page, context }) => {
    await expect(page.getByText('Build a grooming routine that sticks')).toBeVisible();
    await page.getByText('Scan my face').click();

    await expect(page.getByText('How old are you?')).toBeVisible();
    await page.getByText('Under 17').click();
    await expect(page.getByText('Axend is for ages 17 and up')).toBeVisible();

    // A relaunch, not a reload: resetWebApp's init script clears localStorage
    // before every navigation on `page`, so reloading it would wipe the very
    // state under test. A fresh tab in the same context keeps the origin's
    // localStorage and starts the app cold, which is what a relaunch does.
    const relaunched = await context.newPage();
    await relaunched.goto('/');

    await expect(relaunched.getByText('Axend is for ages 17 and up')).toBeVisible();
    await expect(relaunched.getByText('Build a grooming routine that sticks')).toHaveCount(0);
    await relaunched.close();
  });
});
