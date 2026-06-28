import { apiBaseUrl, cacheKey, entitlementId } from './loadApiEnv';

export interface CachedEntitlement {
  active: boolean;
  expiresAt: string | null;
}

function kvConfig() {
  const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '';
  const restToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
  return { restUrl, restToken };
}

async function upstashPipeline(commands: unknown[]) {
  const { restUrl, restToken } = kvConfig();
  const res = await fetch(`${restUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${restToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`upstash pipeline ${res.status}`);
  return res.json() as Promise<{ result: string | null }[]>;
}

export async function readEntitlementCache(appUserId: string): Promise<CachedEntitlement | null> {
  const data = await upstashPipeline([['GET', cacheKey(appUserId)]]);
  const raw = data?.[0]?.result;
  if (raw == null) return null;
  const parsed = JSON.parse(raw) as { a: number; e: string | null };
  return { active: parsed.a === 1, expiresAt: parsed.e ?? null };
}

export async function grantPromotionalEntitlement(appUserId: string): Promise<void> {
  const rcKey = process.env.REVENUECAT_API_KEY ?? '';
  const rcBase = process.env.REVENUECAT_API_BASE ?? 'https://api.revenuecat.com/v1';
  const ent = encodeURIComponent(entitlementId());

  const createRes = await fetch(`${rcBase}/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { Authorization: `Bearer ${rcKey}` },
  });
  if (!createRes.ok) {
    throw new Error(`create subscriber failed: ${createRes.status}`);
  }

  const grantRes = await fetch(
    `${rcBase}/subscribers/${encodeURIComponent(appUserId)}/entitlements/${ent}/promotional`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${rcKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: 'monthly' }),
    },
  );
  if (!grantRes.ok) {
    throw new Error(`grant entitlement failed: ${grantRes.status}`);
  }
}

export async function mintScanUploads(appUserId: string): Promise<number> {
  const res = await fetch(`${apiBaseUrl()}/v1/scans/uploads`, {
    method: 'POST',
    headers: { 'X-App-User-Id': appUserId },
  });
  return res.status;
}

export async function sendWebhookInvalidate(
  appUserId: string,
  type = 'INITIAL_PURCHASE',
): Promise<number> {
  const auth = process.env.REVENUECAT_WEBHOOK_AUTH ?? '';
  const res = await fetch(`${apiBaseUrl()}/v1/webhooks/revenuecat`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: { type, app_user_id: appUserId, entitlement_ids: [entitlementId()] },
    }),
  });
  return res.status;
}

export function hasKvCredentials(): boolean {
  const { restUrl, restToken } = kvConfig();
  return Boolean(restUrl && restToken);
}

export function hasRcCredentials(): boolean {
  const key = process.env.REVENUECAT_API_KEY ?? '';
  const auth = process.env.REVENUECAT_WEBHOOK_AUTH ?? '';
  return Boolean(key && !key.includes('REPLACE') && auth && !auth.includes('REPLACE'));
}