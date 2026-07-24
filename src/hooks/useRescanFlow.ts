import { useCallback, useState } from 'react';
import { useScans } from '../store/ScanContext';

export type RescanStep = 'front' | null;

export function useRescanFlow() {
  const { canRescan, rescan, runScan, scanning } = useScans();
  const [rescanStep, setRescanStep] = useState<RescanStep>(null);
  const [justRescanned, setJustRescanned] = useState(false);

  const startRescan = useCallback(() => {
    setJustRescanned(false);
    setRescanStep('front');
  }, []);

  const cancelRescan = useCallback(() => {
    setRescanStep(null);
  }, []);

  // After the front photo is captured, run a real scan through the API. On any
  // failure (offline, 402, API not configured) fall back to the local mock so
  // the flow always completes with a saved scan.
  const onCapture = async (frontUri?: string) => {
    setRescanStep(null);
    try {
      if (!frontUri) throw new Error('missing photo');
      await runScan({ frontUri });
    } catch {
      if (frontUri) rescan(frontUri);
    }
    setJustRescanned(true);
  };

  return { canRescan, rescanStep, startRescan, cancelRescan, onCapture, justRescanned, scanning };
}
