import type { MutableRefObject } from 'react';
import type { View } from 'react-native';

export type ShareTarget = 'instagram' | 'x' | 'whatsapp' | 'tiktok' | 'more';
export type ShareOutcome = 'shared' | 'cancelled' | 'failed';

export async function captureCard(_ref: MutableRefObject<View | null>): Promise<string | null> {
  return null;
}

export async function shareCard(
  _target: ShareTarget,
  _uri: string,
  message: string,
): Promise<ShareOutcome> {
  try {
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator) : undefined;
    if (nav?.share) {
      await nav.share({ text: message });
      return 'shared';
    }
  } catch (e) {
    return /abort|cancel/i.test((e as Error)?.message ?? '') ? 'cancelled' : 'failed';
  }
  return 'failed';
}
