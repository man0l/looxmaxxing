export const isE2E = process.env.EXPO_PUBLIC_E2E === '1';
export const isE2eApiStub = isE2E && process.env.EXPO_PUBLIC_E2E_STUB_API !== '0';
export const e2eAppUserId = process.env.EXPO_PUBLIC_E2E_APP_USER_ID ?? '';

const E2E_SESSION_KEY = 'e2e_app_user_id';

export function resolveE2eAppUserId(): string {
  if (typeof sessionStorage !== 'undefined') {
    const fromSession = sessionStorage.getItem(E2E_SESSION_KEY);
    if (fromSession) return fromSession;
  }
  return e2eAppUserId;
}