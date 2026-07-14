/* eslint-disable @typescript-eslint/no-require-imports */
import type { MutableRefObject } from 'react';
import type { View } from 'react-native';

export type ShareTarget = 'instagram' | 'x' | 'whatsapp' | 'tiktok' | 'more';
export type ShareOutcome = 'shared' | 'cancelled' | 'failed';

export const APP_URL = 'https://looxmaxxing.app';

function resolveDomNode(node: View | null): HTMLElement | null {
  if (!node) return null;
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  const candidate = node as { getScrollableNode?: () => HTMLElement };
  if (typeof candidate.getScrollableNode === 'function') {
    return candidate.getScrollableNode() ?? null;
  }
  return null;
}

async function dataUriToBlob(dataUri: string): Promise<Blob> {
  const res = await fetch(dataUri);
  return res.blob();
}

function downloadDataUri(dataUri: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = dataUri;
  anchor.download = filename;
  anchor.click();
}

export async function captureCard(ref: MutableRefObject<View | null>): Promise<string | null> {
  try {
    const { captureRef } = require('react-native-view-shot');
    await new Promise((r) => setTimeout(r, 350));
    const dom = resolveDomNode(ref.current);
    if (!dom) {
      console.warn('[share] capture: card ref not ready');
      return null;
    }
    return await captureRef(dom, { format: 'png', quality: 1, result: 'data-uri' });
  } catch (e) {
    console.warn('[share] capture failed:', (e as Error)?.message);
    return null;
  }
}

export async function shareCard(
  _target: ShareTarget,
  uri: string,
  message: string,
): Promise<ShareOutcome> {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (!nav) return 'failed';

    const blob = await dataUriToBlob(uri);
    const file = new File([blob], 'axend-share.png', { type: 'image/png' });
    const payload = { text: message, url: APP_URL };

    if (typeof nav.canShare === 'function' && nav.canShare({ ...payload, files: [file] })) {
      await nav.share({ ...payload, files: [file] });
      return 'shared';
    }

    if (nav.share) {
      try {
        await nav.share(payload);
      } catch (e) {
        if (/abort|cancel/i.test((e as Error)?.message ?? '')) return 'cancelled';
      }
    }

    downloadDataUri(uri, 'axend-share.png');
    return 'shared';
  } catch (e) {
    return /abort|cancel/i.test((e as Error)?.message ?? '') ? 'cancelled' : 'failed';
  }
}