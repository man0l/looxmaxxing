/* eslint-disable @typescript-eslint/no-require-imports */
import type { MutableRefObject } from 'react';
import type { View } from 'react-native';

export type ShareTarget = 'instagram' | 'x' | 'whatsapp' | 'tiktok' | 'more';

export const APP_URL = 'https://looxmaxxing.app';

// Facebook App ID is required for the Instagram Stories deep link. Set the real
// value in the RevenueCat-style dashboard / app config before shipping.
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';

export async function captureCard(ref: MutableRefObject<View | null>): Promise<string | null> {
  try {
    const { captureRef } = require('react-native-view-shot');
    return await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
  } catch (e) {
    console.warn('[share] capture failed', e);
    return null;
  }
}

function fileUrl(uri: string): string {
  return uri.startsWith('file://') || uri.startsWith('http') ? uri : `file://${uri}`;
}

export async function shareCard(
  target: ShareTarget,
  uri: string,
  message: string,
): Promise<boolean> {
  let Share: typeof import('react-native-share').default;
  let Social: typeof import('react-native-share').Social;
  try {
    const mod = require('react-native-share');
    Share = mod.default;
    Social = mod.Social;
  } catch (e) {
    console.warn('[share] react-native-share unavailable', e);
    return false;
  }

  const url = fileUrl(uri);
  try {
    switch (target) {
      case 'instagram':
        await Share.shareSingle({
          social: Social.InstagramStories,
          appId: FACEBOOK_APP_ID,
          backgroundImage: url,
        });
        return true;
      case 'x':
        await Share.shareSingle({ social: Social.Twitter, url, message });
        return true;
      case 'whatsapp':
        await Share.shareSingle({ social: Social.Whatsapp, url, message });
        return true;
      case 'tiktok':
      case 'more':
      default:
        await Share.open({ url, message });
        return true;
    }
  } catch (e) {
    const err = e as { message?: string };
    if (err.message && /cancel/i.test(err.message)) return false;
    console.warn('[share] share failed', e);
    return false;
  }
}
