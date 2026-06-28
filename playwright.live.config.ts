import { defineConfig, devices } from '@playwright/test';
import { loadAppEnv } from './e2e/helpers/loadAppEnv';

const PORT = 19006;
const BASE_URL = `http://localhost:${PORT}`;
const appEnv = loadAppEnv();
const E2E_APP_USER_ID = process.env.EXPO_PUBLIC_E2E_APP_USER_ID ?? 'e2e_web_playwright';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['entitlement-cache.spec.ts', 'live-api-flow.spec.ts'],
  timeout: 180_000,
  expect: { timeout: 90_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: `npx expo start --web --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      ...appEnv,
      EXPO_PUBLIC_E2E: '1',
      EXPO_PUBLIC_E2E_STUB_API: '0',
      EXPO_PUBLIC_E2E_APP_USER_ID: E2E_APP_USER_ID,
      EXPO_PUBLIC_API_BASE_URL:
        process.env.EXPO_PUBLIC_API_BASE_URL ??
        appEnv.EXPO_PUBLIC_API_BASE_URL ??
        'https://looxmaxxing-api.vercel.app',
    },
  },
  projects: [
    {
      name: 'api',
      testMatch: 'entitlement-cache.spec.ts',
    },
    {
      name: 'web',
      testMatch: 'live-api-flow.spec.ts',
    },
  ],
});