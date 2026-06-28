import { useEffect, useState } from 'react';
import {
  getCachedRender,
  getCachedRenderForTrait,
  hydrateRenderCache,
  subscribeRenderCache,
} from '../services/renderCache';

export function useCachedRender(
  traitId: string,
  style?: string,
  opts?: { anyStyle?: boolean },
): string | null {
  const [, tick] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    hydrateRenderCache().then(() => {
      if (mounted) setReady(true);
    });
    const unsub = subscribeRenderCache(() => tick((n) => n + 1));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  if (!ready) return null;
  return opts?.anyStyle
    ? getCachedRenderForTrait(traitId, style)
    : getCachedRender(traitId, style);
}