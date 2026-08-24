import { useCallback, useRef, useState } from 'react';
import { useScans } from '../store/ScanContext';
import { useAiShareConsent } from '../store/AiShareConsentContext';
import { isAiShareConsentError } from '../services/aiShareConsent';

export type RescanStep = 'front' | 'consent' | null;

export function useRescanFlow() {
  const { canRescan, rescan, runScan, scanning } = useScans();
  const { granted } = useAiShareConsent();
  const [rescanStep, setRescanStep] = useState<RescanStep>(null);
  const [justRescanned, setJustRescanned] = useState(false);
  const pendingUri = useRef<string | undefined>(undefined);

  const startRescan = useCallback(() => {
    setJustRescanned(false);
    pendingUri.current = undefined;
    setRescanStep('front');
  }, []);

  const cancelRescan = useCallback(() => {
    pendingUri.current = undefined;
    setRescanStep(null);
  }, []);

  const finishScan = useCallback(
    async (frontUri?: string) => {
      setRescanStep(null);
      try {
        if (!frontUri) throw new Error('missing photo');
        await runScan({ frontUri });
      } catch (e) {
        if (isAiShareConsentError(e)) return;
        if (frontUri) rescan(frontUri);
      }
      setJustRescanned(true);
    },
    [rescan, runScan],
  );

  const onCapture = async (frontUri?: string) => {
    if (!granted) {
      pendingUri.current = frontUri;
      setRescanStep('consent');
      return;
    }
    await finishScan(frontUri);
  };

  const onConsentAgree = async () => {
    const uri = pendingUri.current;
    pendingUri.current = undefined;
    await finishScan(uri);
  };

  return {
    canRescan,
    rescanStep,
    startRescan,
    cancelRescan,
    onCapture,
    onConsentAgree,
    justRescanned,
    scanning,
  };
}
