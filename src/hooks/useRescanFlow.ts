import { useState } from 'react';
import { useScans } from '../store/ScanContext';

export type RescanStep = 'front' | 'profile' | null;

export function useRescanFlow() {
  const { canRescan, rescan } = useScans();
  const [rescanStep, setRescanStep] = useState<RescanStep>(null);
  const [justRescanned, setJustRescanned] = useState(false);
  const [frontUri, setFrontUri] = useState<string | undefined>(undefined);

  const startRescan = () => {
    setJustRescanned(false);
    setFrontUri(undefined);
    setRescanStep('front');
  };

  const onCapture = (uri?: string) => {
    if (rescanStep === 'front') {
      setFrontUri(uri);
      setRescanStep('profile');
    } else {
      rescan(frontUri);
      setRescanStep(null);
      setJustRescanned(true);
    }
  };

  return { canRescan, rescanStep, startRescan, onCapture, justRescanned };
}
