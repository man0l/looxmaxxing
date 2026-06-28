import { useCallback } from 'react';
import { useScans } from '../store/ScanContext';
import { useToast } from '../store/ToastContext';

export function useCaptureFabPress(startRescan: () => void) {
  const { canRescan, hasRealScan } = useScans();
  const { showToast } = useToast();

  const onCaptureFabPress = useCallback(() => {
    if (canRescan) {
      startRescan();
      return;
    }
    showToast('Complete your first scan to unlock re-rating.', 'info');
  }, [canRescan, hasRealScan, startRescan, showToast]);

  return { onCaptureFabPress, canRescan };
}