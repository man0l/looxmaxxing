import { test, expect } from '@playwright/test';
import { loadApiEnv } from './helpers/loadApiEnv';
import {
  grantPromotionalEntitlement,
  hasKvCredentials,
  hasRcCredentials,
  mintScanUploads,
  readEntitlementCache,
  sendWebhookInvalidate,
} from './helpers/entitlementCache';

test.describe('Entitlement cache (Upstash + RevenueCat webhook)', () => {
  test.beforeAll(() => {
    loadApiEnv();
  });

  test('populates on gated request and invalidates on webhook', async () => {
    test.skip(!hasRcCredentials(), 'looxmaxxing-api/.env missing REVENUECAT_API_KEY or REVENUECAT_WEBHOOK_AUTH');
    test.skip(!hasKvCredentials(), 'looxmaxxing-api/.env missing KV_REST_API_URL / KV_REST_API_TOKEN');

    const appUserId = `e2e_cache_${Date.now()}`;

    await grantPromotionalEntitlement(appUserId);

    expect(await mintScanUploads(appUserId)).toBe(200);
    expect(await mintScanUploads(appUserId)).toBe(200);

    const cached = await readEntitlementCache(appUserId);
    expect(cached).not.toBeNull();
    expect(cached!.active).toBe(true);
    expect(cached!.expiresAt).toBeTruthy();

    expect(await sendWebhookInvalidate(appUserId)).toBe(200);

    const afterInvalidate = await readEntitlementCache(appUserId);
    expect(afterInvalidate).toBeNull();
  });
});