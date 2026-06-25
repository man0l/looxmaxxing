import { useState } from 'react';
import { useScans } from '../store/ScanContext';

export type RescanStep = 'front' | 'profile' | null;

export function useRescanFlow() {
  const { canRescan, rescan, runScan, scanning } = useScans();
  const [rescanStep, setRescanStep] = useState<RescanStep>(null);
  const [justRescanned, setJustRescanned] = useState(false);
  const [frontUri, setFrontUri] = useState<string | undefined>(undefined);

  const startRescan = () => {
    setJustRescanned(false);
    setFrontUri(undefined);
    setRescanStep('front');
  };

  // After both photos are captured, run a real scan through the API. On any
  // failure (offline, 402, API not configured) fall back to the local mock so
  // the flow always completes with a saved scan.
  const onCapture = async (uri?: string) => {
    if (rescanStep === 'front') {
      setFrontUri(uri);
      setRescanStep('profile');
      return;
    }
    const profileUri = uri;
    setRescanStep(null);
    try {
      if (!frontUri || !profileUri) throw new Error('missing photo');
      await runScan({ frontUri, profileUri });
    } catch {
      if (frontUri) rescan(frontUri);
    }
    setJustRescanned(true);
  };

  return { canRescan, rescanStep, startRescan, onCapture, justRescanned, scanning };
}
