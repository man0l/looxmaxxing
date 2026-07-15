import type { TraitScore } from '../types/traits';
import { isE2eApiStub } from '../config/e2e';
import { getScores } from './scoring';
import { resolveCaptureUri } from './photoUri';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const PHOTO_READ_TIMEOUT_MS = 30_000;
const API_TIMEOUT_MS = 90_000;

const E2E_RENDER_IMAGE =
  'https://placehold.co/232x232/3A2A1A/EFE6D8.png?text=E2E+Render';

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

function isTransientNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const name = e.name;
  const msg = (e.message ?? '').toLowerCase();
  // RN's fetch polyfill (whatwg-fetch) emits:
  //   - DOMException('Aborted', 'AbortError')  on controller.abort() / timeout
  //   - TypeError('Network request failed')    on connection drop (xhr.onerror)
  //   - TypeError('Network request timed out') on xhr.ontimeout
  // All three are transient and worth a retry with a friendlier message.
  return (
    name === 'AbortError' ||
    name === 'TypeError' ||
    msg.includes('network') ||
    msg.includes('abort') ||
    msg.includes('cancel') ||
    msg.includes('timed out')
  );
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromExternal = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromExternal);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (externalSignal?.aborted) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ScanApiError(504, `Request timed out after ${timeoutMs / 1000}s`);
    }
    if (isTransientNetworkError(e)) {
      // Wrap whatwg-fetch's raw "Network request failed" / "Network request
      // timed out" so the UI doesn't surface a low-sounding message.
      throw new ScanApiError(0, 'Network connection failed. Check your internet and try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', abortFromExternal);
  }
}

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
}

// One automatic retry for transient network failures (connection drops,
// aborts, timeouts). Photo uploads and scan scoring both go through this so a
// single OkHttp hiccup doesn't kick the user to the "Couldn't finish your
// scan" screen — they only see errors that persist across two attempts.
async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ScanApiError && (e.status === 0 || e.status === 504 || e.status >= 500)) {
      return fn();
    }
    if (isTransientNetworkError(e)) {
      return fn();
    }
    throw e;
  }
}

// Uploads a local photo (file:// URI) to a Storage signed PUT URL. No Supabase
// SDK and no apikey needed — the signed URL authenticates itself. Retries once
// on transient network failures so a single dropped connection doesn't surface
// as a hard scan failure.
async function putPhoto(
  uploadUrl: string,
  uri: string,
  contentType: string,
): Promise<void> {
  await withTransientRetry(async () => {
    const localUri = await resolveCaptureUri(uri);
    const readRes = await fetchWithTimeout(localUri, {}, PHOTO_READ_TIMEOUT_MS);
    // The Blob polyfill on RN Android can't convert ArrayBuffer-backed responses
    // for some sources (e.g. dev Metro assets throw
    // "Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not supported").
    // Read raw bytes via arrayBuffer() — fetch accepts an ArrayBuffer body
    // natively, and Supabase Storage accepts binary PUTs.
    const bytes = await readRes.arrayBuffer();
    const res = await fetchWithTimeout(
      uploadUrl,
      {
        method: 'PUT',
        body: bytes,
        headers: { 'Content-Type': contentType, 'x-upsert': 'true' },
      },
      API_TIMEOUT_MS,
    );
    await assertOk(res, 'photo upload');
  });
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
  if (isE2eApiStub || (__DEV__ && !API_BASE)) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      scoredAt: new Date().toISOString(),
      provider: isE2eApiStub ? 'e2e' : 'dev-stub',
      model: 'stub',
      scores: getScores(),
    };
  }
  if (!API_BASE) {
    throw new ScanApiError(0, 'EXPO_PUBLIC_API_BASE_URL is not set');
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-App-User-Id': opts.appUserId,
  };

  const slotRes = await fetchWithTimeout(
    `${API_BASE}/v1/scans/uploads`,
    { method: 'POST', headers },
    API_TIMEOUT_MS,
  );
  await assertOk(slotRes, 'mint upload slots');
  const { scanId, uploads } = (await slotRes.json()) as ScanUploadsResponse;

  await Promise.all([
    putPhoto(uploads.front.uploadUrl, opts.frontUri, opts.frontContentType ?? 'image/jpeg'),
    putPhoto(uploads.profile.uploadUrl, opts.profileUri, opts.profileContentType ?? 'image/jpeg'),
  ]);

  const scanRes = await fetchWithTimeout(
    `${API_BASE}/v1/scans`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ scanId }),
    },
    API_TIMEOUT_MS,
  );
  await assertOk(scanRes, 'scan');
  return (await scanRes.json()) as ScanResult;
}

export interface RenderResult {
  imageUrl: string;
  expiresAt?: string;
}

interface RenderUploadResponse {
  jobId: string;
  upload: { path: string; uploadUrl: string; token: string | null };
}

type RenderStatus = 'processing' | 'done' | 'failed';
interface RenderStatusResponse {
  jobId: string;
  status: RenderStatus;
  imageUrl?: string;
  expiresAt?: string;
}

// Direct-to-Storage avatar render (mirrors submitScan): mint a signed upload
// slot, PUT the reference photo, POST /v1/renders. If the API responds inline
// (done) the image is ready; if async (processing), poll GET /v1/renders/:jobId
// until it completes or fails (the Edge Function does the work in the background).
export async function invalidateEntitlementCache(appUserId: string): Promise<void> {
  if (!API_BASE || !appUserId) return;
  try {
    await fetchWithTimeout(
      `${API_BASE}/v1/entitlement/invalidate`,
      { method: 'POST', headers: { 'X-App-User-Id': appUserId } },
      10_000,
    );
  } catch {
    // best-effort — failure is silent, the TTL will expire on its own
  }
}

export async function deleteUserData(
  appUserId: string,
  scope: 'photos' | 'all' = 'all',
): Promise<{ ok: boolean }> {
  if (!API_BASE || !appUserId) return { ok: true };
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/v1/user-data?scope=${scope}`,
      { method: 'DELETE', headers: { 'X-App-User-Id': appUserId } },
      15_000,
    );
    if (!res.ok) await assertOk(res, 'delete user data');
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function submitRender(opts: {
  appUserId: string;
  photoUri: string;
  traitId: string;
  style?: string;
  contentType?: string;
  signal?: AbortSignal;
}): Promise<RenderResult> {
  const { signal } = opts;
  assertNotAborted(signal);
  if (isE2eApiStub || (__DEV__ && !API_BASE)) {
    await new Promise((r) => setTimeout(r, 300));
    assertNotAborted(signal);
    return {
      imageUrl: E2E_RENDER_IMAGE,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }
  if (!API_BASE) throw new ScanApiError(0, 'EXPO_PUBLIC_API_BASE_URL is not set');
  const headers = { 'Content-Type': 'application/json', 'X-App-User-Id': opts.appUserId };

  const slotRes = await fetchWithTimeout(
    `${API_BASE}/v1/renders/uploads`,
    { method: 'POST', headers },
    API_TIMEOUT_MS,
    signal,
  );
  await assertOk(slotRes, 'mint render slot');
  const { jobId, upload } = (await slotRes.json()) as RenderUploadResponse;

  await putPhoto(upload.uploadUrl, opts.photoUri, opts.contentType ?? 'image/jpeg');

  assertNotAborted(signal);
  const startRes = await fetchWithTimeout(
    `${API_BASE}/v1/renders`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ jobId, traitId: opts.traitId, style: opts.style ?? null }),
    },
    API_TIMEOUT_MS,
    signal,
  );
  await assertOk(startRes, 'render');
  const started = (await startRes.json()) as RenderStatusResponse;
  if (started.status === 'done' && started.imageUrl) {
    return { imageUrl: started.imageUrl, expiresAt: started.expiresAt };
  }

  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    assertNotAborted(signal);
    await new Promise((r) => setTimeout(r, 4000));
    assertNotAborted(signal);
    const pollRes = await fetchWithTimeout(
      `${API_BASE}/v1/renders/${jobId}`,
      { headers },
      API_TIMEOUT_MS,
      signal,
    );
    await assertOk(pollRes, 'render status');
    const poll = (await pollRes.json()) as RenderStatusResponse;
    if (poll.status === 'done' && poll.imageUrl) {
      return { imageUrl: poll.imageUrl, expiresAt: poll.expiresAt };
    }
    if (poll.status === 'failed') throw new ScanApiError(502, 'Render failed');
  }
  throw new ScanApiError(504, 'Render timed out');
}
