/* eslint-disable @typescript-eslint/no-require-imports */
import type { MutableRefObject } from 'react';
import { Linking } from 'react-native';
import type { View } from 'react-native';

export type ShareTarget = 'instagram' | 'x' | 'whatsapp' | 'tiktok' | 'more';

export const APP_URL = 'https://looxmaxxing.app';

// Facebook App ID is required for the Instagram Stories deep link.
// Set EXPO_PUBLIC_FACEBOOK_APP_ID in .env / CI secrets.
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';

export async function captureCard(ref: MutableRefObject<View | null>): Promise<string | null> {
  try {
    const { captureRef } = require('react-native-view-shot');
    await new Promise((r) => setTimeout(r, 300));
    if (!ref.current) return null;
    return await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
  } catch {
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

  const nativeSheet = async () => {
    await Share.open({ url, message });
  };

  const webFallback = async (webUrl: string) => {
    const supported = await Linking.canOpenURL(webUrl);
    if (supported) await Linking.openURL(webUrl);
    else await nativeSheet();
  };

  try {
    switch (target) {
      case 'instagram':
        try {
          await Share.shareSingle({
            social: Social.InstagramStories,
            appId: FACEBOOK_APP_ID,
            backgroundImage: url,
          });
        } catch {
          await nativeSheet();
        }
        return true;

      case 'x':
        try {
          await Share.shareSingle({ social: Social.Twitter, url, message });
        } catch {
          await webFallback(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
        }
        return true;

      case 'whatsapp':
        try {
          await Share.shareSingle({ social: Social.Whatsapp, url, message });
        } catch {
          await webFallback(`https://wa.me/?text=${encodeURIComponent(message)}`);
        }
        return true;

      case 'tiktok':
      case 'more':
      default:
        await nativeSheet();
        return true;
    }
  } catch (e) {
    const err = e as { message?: string };
    if (err.message && /cancel/i.test(err.message)) return false;
    console.warn('[share] share failed:', err.message);
    return false;
  }
}
