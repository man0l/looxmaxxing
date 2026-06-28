import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiEnv = resolve(process.cwd(), '..', 'looxmaxxing-api', '.env');

export function loadApiEnv(): void {
  if (!existsSync(apiEnv)) return;
  for (const line of readFileSync(apiEnv, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

export function apiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://looxmaxxing-api.vercel.app';
}

export function entitlementId(): string {
  return process.env.REVENUECAT_ENTITLEMENT_ID ?? 'Looksmaxxing Pro';
}

export function cacheKey(appUserId: string): string {
  return `ent:${entitlementId()}:${appUserId}`;
}