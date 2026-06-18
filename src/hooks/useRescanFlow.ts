import { useState } from 'react';
import { useScans } from '../store/ScanContext';

export type RescanStep = 'front' | 'profile' | null;

export function useRescanFlow() {
  const { canRescan, rescan } = useScans();
  const [rescanStep, setRescanStep] = useState<RescanStep>(null);
  const [justRescanned, setJustRescanned] = useState(false);

  const startRescan = () => {
    setJustRescanned(false);
    setRescanStep('front');
  };

  const onCapture = (_uri?: string) => {
    if (rescanStep === 'front') {
      setRescanStep('profile');
    } else {
      rescan();
      setRescanStep(null);
      setJustRescanned(true);
    }
  };

  return { canRescan, rescanStep, startRescan, onCapture, justRescanned };
}
