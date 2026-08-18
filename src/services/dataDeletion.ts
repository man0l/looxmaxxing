import { clearAllAppData } from './storage';

type Handler = () => void | Promise<void>;

const localHandlers = new Set<Handler>();
let subscriptionReset: (() => void) | undefined;
let appLifecycleReset: (() => void) | undefined;

export function registerLocalDataReset(handler: Handler): () => void {
  localHandlers.add(handler);
  return () => localHandlers.delete(handler);
}

export function registerSubscriptionReset(handler: () => void): () => void {
  subscriptionReset = handler;
  return () => {
    subscriptionReset = undefined;
  };
}

export function registerAppLifecycleReset(handler: () => void): () => void {
  appLifecycleReset = handler;
  return () => {
    appLifecycleReset = undefined;
  };
}

export async function wipeLocalAppData(): Promise<void> {
  for (const handler of localHandlers) {
    await handler();
  }
  await clearAllAppData();
}

/**
 * Sends the app back through the onboarding flow without wiping stored data.
 * Used when a user re-declares an ineligible age from Profile — they have to
 * pass the age gate again before they can get back into the app.
 */
export function returnToOnboarding(): void {
  appLifecycleReset?.();
}

export function runPostDeletionReset(): void {
  subscriptionReset?.();
  appLifecycleReset?.();
}