import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiEnv = resolve(root, '..', 'looxmaxxing-api', '.env');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(apiEnv);

const appUserId = process.argv[2] ?? process.env.EXPO_PUBLIC_E2E_APP_USER_ID ?? 'e2e_web_playwright';
const rcKey = process.env.REVENUECAT_API_KEY ?? '';
const entitlement = process.env.REVENUECAT_ENTITLEMENT_ID ?? 'Looksmaxxing Pro';
const rcBase = process.env.REVENUECAT_API_BASE ?? 'https://api.revenuecat.com/v1';

if (!rcKey || rcKey.includes('REPLACE')) {
  console.error('REVENUECAT_API_KEY missing — copy looxmaxxing-api/.env');
  process.exit(1);
}

const createRes = await fetch(`${rcBase}/subscribers/${encodeURIComponent(appUserId)}`, {
  headers: { Authorization: `Bearer ${rcKey}` },
});
if (!createRes.ok) {
  const err = await createRes.json().catch(() => null);
  console.error('create subscriber failed', createRes.status, err);
  process.exit(1);
}

const url = `${rcBase}/subscribers/${encodeURIComponent(appUserId)}/entitlements/${encodeURIComponent(entitlement)}/promotional`;
const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Bearer ${rcKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ duration: 'monthly' }),
});
const body = await res.json().catch(() => null);
if (!res.ok) {
  console.error('grant failed', res.status, body);
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, appUserId, expires: body?.subscriber?.entitlements?.[entitlement]?.expires_date }));