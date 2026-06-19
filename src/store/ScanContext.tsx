import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Scan } from '../types/scan';
import { getScores, improveScores } from '../services/scoring';

const RESCAN_DAYS = 14;
const DAY_MS = 86400000;

function seedScans(): Scan[] {
  const d = new Date();
  d.setDate(d.getDate() - 16);
  return [{ id: 'scan-1', date: d.toISOString(), scores: getScores() }];
}

interface ScanValue {
  scans: Scan[];
  latest: Scan;
  canRescan: boolean;
  daysUntilRescan: number;
  rescan: (photoUri?: string) => void;
}

const ScanContext = createContext<ScanValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<Scan[]>(seedScans);
  const [mountNow] = useState(() => Date.now());

  const rescan = useCallback((photoUri?: string) => {
    setScans((prev) => {
      const improved = improveScores(prev[0].scores);
      const next: Scan = {
        id: `scan-${prev.length + 1}`,
        date: new Date().toISOString(),
        scores: improved,
        photoUri,
      };
      return [next, ...prev];
    });
  }, []);

  const value = useMemo<ScanValue>(() => {
    const latest = scans[0];
    const daysSince = Math.max(
      0,
      Math.floor((mountNow - new Date(latest.date).getTime()) / DAY_MS),
    );
    const daysUntilRescan = Math.max(0, RESCAN_DAYS - daysSince);
    return {
      scans,
      latest,
      canRescan: daysUntilRescan === 0,
      daysUntilRescan,
      rescan,
    };
  }, [scans, rescan, mountNow]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScans() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScans must be used within ScanProvider');
  return ctx;
}
