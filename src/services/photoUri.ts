import { Image, Platform } from 'react-native';
import { isE2E } from '../config/e2e';

const FRONT_TEST = require('../../assets/images/onboarding-flow-image1-optimized.png');
const PROFILE_TEST = require('../../assets/images/onboarding-flow-image1-optimized.png');

const E2E_WEB_PHOTOS = {
  front: '/e2e/e2e-front.jpg',
  profile: '/e2e/e2e-profile.jpg',
} as const;

function webAssetUri(asset: number): string {
  const mod = asset as unknown;
  if (typeof mod === 'string') return mod;
  if (typeof mod === 'object' && mod && 'default' in mod) {
    return String((mod as { default: string }).default);
  }
  if (typeof mod === 'object' && mod && 'uri' in mod) {
    return String((mod as { uri: string }).uri);
  }
  return '';
}

function nativeAssetUri(asset: number): string {
  const resolved = Image.resolveAssetSource(asset);
  return resolved?.uri ?? '';
}

function assetUri(asset: number): string {
  return Platform.OS === 'web' ? webAssetUri(asset) : nativeAssetUri(asset);
}

export async function resolveDevTestPhotoUri(angle: 'front' | 'profile'): Promise<string> {
  if (Platform.OS === 'web' && isE2E) {
    return E2E_WEB_PHOTOS[angle];
  }
  const asset = angle === 'front' ? FRONT_TEST : PROFILE_TEST;
  const uri = assetUri(asset);
  return uri || `e2e://${angle}-photo`;
}

export async function resolveCaptureUri(uri: string): Promise<string> {
  if (!uri.startsWith('e2e://')) return uri;
  const angle = uri.includes('profile') ? 'profile' : 'front';
  return resolveDevTestPhotoUri(angle);
}