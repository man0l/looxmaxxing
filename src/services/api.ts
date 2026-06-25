import type { TraitScore } from '../types/traits';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export interface ScanResult {
  scoredAt: string;
  provider: string;
  model: string;
  scores: TraitScore[];
}

interface ScanUploadSlot {
  path: string;
  uploadUrl: string;
  token: string | null;
}

interface ScanUploadsResponse {
  scanId: string;
  uploads: { front: ScanUploadSlot; profile: ScanUploadSlot };
}

export class ScanApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function assertOk(res: Response, label: string): Promise<void> {
  if (res.ok) return;
  let detail = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    if (body?.error?.message) detail = body.error.message;
  } catch {
    /* keep status text */
  }
  throw new ScanApiError(res.status, `${label} failed: ${detail}`);
}

// Uploads a local photo (file:// URI) to a Storage signed PUT URL. No Supabase
// SDK and no apikey needed — the signed URL authenticates itself.
async function putPhoto(
  uploadUrl: string,
  uri: string,
  contentType: string,
): Promise<void> {
  const blob = await (await fetch(uri)).blob();
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType, 'x-upsert': 'true' },
  });
  await assertOk(res, 'photo upload');
}

// Direct-to-Storage scan flow (avoids the serverless request-body limit):
// 1) mint two signed upload slots (gated), 2) upload front + profile straight to
// Storage, 3) POST /v1/scans with the scanId — the API downloads, scores, and
// deletes both photos server-side. `appUserId` is the RevenueCat app user id.
export async function submitScan(opts: {
  appUserId: string;
  frontUri: string;
  profileUri: string;
  frontContentType?: string;
  profileContentType?: string;
}): Promise<ScanResult> {
  if (!API_BASE) {
    throw new ScanApiError(0, 'EXPO_PUBLIC_API_BASE_URL is not set');
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-App-User-Id': opts.appUserId,
  };

  const slotRes = await fetch(`${API_BASE}/v1/scans/uploads`, {
    method: 'POST',
    headers,
  });
  await assertOk(slotRes, 'mint upload slots');
  const { scanId, uploads } = (await slotRes.json()) as ScanUploadsResponse;

  await Promise.all([
    putPhoto(uploads.front.uploadUrl, opts.frontUri, opts.frontContentType ?? 'image/jpeg'),
    putPhoto(uploads.profile.uploadUrl, opts.profileUri, opts.profileContentType ?? 'image/jpeg'),
  ]);

  const scanRes = await fetch(`${API_BASE}/v1/scans`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ scanId }),
  });
  await assertOk(scanRes, 'scan');
  return (await scanRes.json()) as ScanResult;
}
