/* eslint-disable @typescript-eslint/no-require-imports */
import type { MutableRefObject } from 'react';
import type { View } from 'react-native';

export type ShareTarget = 'instagram' | 'x' | 'whatsapp' | 'tiktok' | 'more';
export type ShareOutcome = 'shared' | 'cancelled' | 'failed';

export const APP_URL = 'https://looxmaxxing.app';

// Facebook App ID is required for the Instagram Stories deep link.
// Set EXPO_PUBLIC_FACEBOOK_APP_ID in .env / CI secrets.
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';

export async function captureCard(ref: MutableRefObject<View | null>): Promise<string | null> {
  try {
    const { captureRef } = require('react-native-view-shot');
    await new Promise((r) => setTimeout(r, 350));
    if (!ref.current) {
      console.warn('[share] capture: card ref not ready');
      return null;
    }
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    console.log('[share] captured', uri);
    return uri;
  } catch (e) {
    console.warn('[share] capture failed:', (e as Error)?.message);
    return null;
  }
}

function fileUrl(uri: string): string {
  return uri.startsWith('file://') || uri.startsWith('http') ? uri : `file://${uri}`;
}

function isCancel(e: unknown): boolean {
  const m = (e as { message?: string })?.message ?? '';
  return /cancel|dismiss|user did not share/i.test(m);
}

export async function shareCard(
  target: ShareTarget,
  uri: string,
  message: string,
): Promise<ShareOutcome> {
  let Share: typeof import('react-native-share').default;
  let Social: typeof import('react-native-share').Social;
  try {
    const mod = require('react-native-share');
    Share = mod.default;
    Social = mod.Social;
  } catch (e) {
    console.warn('[share] react-native-share unavailable', e);
    return 'failed';
  }

  const url = fileUrl(uri);
  // An explicit mime type is required for several Social handlers (X/Twitter
  // throws ActivityNotFound without it) and lets Android resolve the target app.
  const image = { url, type: 'image/png', filename: 'looxmaxxing', failOnCancel: false } as const;

  const single = async (opts: Record<string, unknown>) => {
    await Share.shareSingle(opts as unknown as Parameters<typeof Share.shareSingle>[0]);
  };

  const nativeSheet = async () => {
    await Share.open({ url, type: 'image/png', message, failOnCancel: false });
  };

  try {
    switch (target) {
      case 'instagram':
        try {
          if (FACEBOOK_APP_ID) {
            await single({
              social: Social.InstagramStories,
              appId: FACEBOOK_APP_ID,
              backgroundImage: url,
              failOnCancel: false,
            });
          } else {
            await single({ social: Social.Instagram, ...image });
          }
        } catch (e) {
          if (isCancel(e)) return 'cancelled';
          console.warn('[share] instagram failed -> sheet:', (e as Error)?.message);
          await nativeSheet();
        }
        return 'shared';

      case 'whatsapp':
        try {
          await single({ social: Social.Whatsapp, message, ...image });
        } catch (e) {
          if (isCancel(e)) return 'cancelled';
          console.warn('[share] whatsapp failed -> sheet:', (e as Error)?.message);
          await nativeSheet();
        }
        return 'shared';

      case 'x':
      case 'tiktok':
      case 'more':
      default:
        // react-native-share can't open X or TikTok directly (TwitterShare has no
        // component class; TikTok has no Social target and rejects static images),
        // so these route to the system share sheet with the image + text attached.
        await nativeSheet();
        return 'shared';
    }
  } catch (e) {
    if (isCancel(e)) return 'cancelled';
    console.warn('[share] failed:', (e as Error)?.message);
    return 'failed';
  }
}
