import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'render-cache-v1';
const DEFAULT_TTL_MS = 55 * 60 * 1000;

interface CacheEntry {
  imageUrl: string;
  expiresAt: number;
}

type CacheMap = Record<string, CacheEntry>;

let memory: CacheMap = {};
let hydratePromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function renderCacheKey(traitId: string, style?: string): string {
  return `${traitId}:${style ?? 'default'}`;
}

function isExpired(entry: CacheEntry): boolean {
  return Date.now() >= entry.expiresAt;
}

function prune(map: CacheMap): CacheMap {
  const next: CacheMap = {};
  for (const [k, v] of Object.entries(map)) {
    if (!isExpired(v)) next[k] = v;
  }
  return next;
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

export function subscribeRenderCache(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function hydrateRenderCache(): Promise<void> {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        memory = raw ? prune(JSON.parse(raw) as CacheMap) : {};
      } catch {
        memory = {};
      }
    })();
  }
  return hydratePromise;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prune(memory)));
  } catch {
    /* quota / offline */
  }
}

export function getCachedRender(traitId: string, style?: string): string | null {
  const entry = memory[renderCacheKey(traitId, style)];
  if (!entry || isExpired(entry)) return null;
  return entry.imageUrl;
}

export function getCachedRenderForTrait(traitId: string, preferredStyle?: string): string | null {
  if (preferredStyle) {
    const preferred = getCachedRender(traitId, preferredStyle);
    if (preferred) return preferred;
  }
  const prefix = `${traitId}:`;
  for (const [key, entry] of Object.entries(memory)) {
    if (key.startsWith(prefix) && !isExpired(entry)) return entry.imageUrl;
  }
  return null;
}

export async function setCachedRender(
  traitId: string,
  style: string | undefined,
  imageUrl: string,
  expiresAt?: string,
): Promise<void> {
  const expires = expiresAt ? new Date(expiresAt).getTime() : Date.now() + DEFAULT_TTL_MS;
  memory[renderCacheKey(traitId, style)] = { imageUrl, expiresAt: expires };
  notify();
  await persist();
}