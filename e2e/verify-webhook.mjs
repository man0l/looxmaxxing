import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiEnv = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'looxmaxxing-api', '.env');
if (existsSync(apiEnv)) {
  for (const line of readFileSync(apiEnv, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^REVENUECAT_WEBHOOK_AUTH=(.+)$/);
    if (m) process.env.REVENUECAT_WEBHOOK_AUTH = m[1].trim();
  }
}

const auth = process.env.REVENUECAT_WEBHOOK_AUTH ?? '';
const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://looxmaxxing-api.vercel.app';
if (!auth) {
  console.error('REVENUECAT_WEBHOOK_AUTH missing');
  process.exit(1);
}

const res = await fetch(`${base}/v1/webhooks/revenuecat`, {
  method: 'POST',
  headers: { Authorization: auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: {
      type: 'TEST',
      app_user_id: 'e2e_web_playwright',
      entitlement_ids: ['Looksmaxxing Pro'],
    },
  }),
});
const text = await res.text();
console.log(JSON.stringify({ status: res.status, body: text.slice(0, 200) }));
process.exit(res.ok ? 0 : 1);