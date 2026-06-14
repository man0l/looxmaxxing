import type { MutableRefObject } from 'react';
import type { View } from 'react-native';

export type ShareTarget = 'instagram' | 'x' | 'whatsapp' | 'tiktok' | 'more';

export const APP_URL = 'https://looxmaxxing.app';

export async function captureCard(_ref: MutableRefObject<View | null>): Promise<string | null> {
  return null;
}

export async function shareCard(
  _target: ShareTarget,
  _uri: string,
  message: string,
): Promise<boolean> {
  try {
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator) : undefined;
    if (nav?.share) {
      await nav.share({ text: message, url: APP_URL });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
