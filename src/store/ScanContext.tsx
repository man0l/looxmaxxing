import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Scan } from '../types/scan';
import { getScores, improveScores } from '../services/scoring';
import { submitScan } from '../services/api';
import { getAppUserID } from '../services/purchases';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

const RESCAN_DAYS = 14;
const DAY_MS = 86400000;

interface ScanStore {
  scans: Scan[];
  hasRealScan: boolean;
}

function placeholderScan(): Scan {
  return { id: 'placeholder', date: new Date().toISOString(), scores: getScores() };
}

interface ScanValue {
  scans: Scan[];
  latest: Scan;
  canRescan: boolean;
  daysUntilRescan: number;
  rescan: (photoUri?: string) => void;
  scanning: boolean;
  scanError: string | null;
  hasRealScan: boolean;
  runScan: (photos: { frontUri: string; profileUri: string }) => Promise<void>;
}

const ScanContext = createContext<ScanValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [mountNow] = useState(() => Date.now());
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasRealScan, setHasRealScan] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const firstRealScanDone = useRef(false);

  useEffect(() => {
    loadJson<ScanStore>(STORAGE_KEYS.scans).then((saved) => {
      if (saved) {
        setScans(saved.scans);
        setHasRealScan(saved.hasRealScan);
        firstRealScanDone.current = saved.hasRealScan;
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_KEYS.scans, { scans, hasRealScan } satisfies ScanStore);
  }, [scans, hasRealScan, hydrated]);

  const rescan = useCallback((photoUri?: string) => {
    setScans((prev) => {
      const base = prev[0] ?? placeholderScan();
      const improved = improveScores(base.scores);
      const next: Scan = {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        scores: improved,
        photoUri,
      };
      return [next, ...prev];
    });
  }, []);

  const runScan = useCallback(
    async ({ frontUri, profileUri }: { frontUri: string; profileUri: string }) => {
      setScanning(true);
      setScanError(null);
      try {
        const appUserId = await getAppUserID();
        const result = await submitScan({ appUserId, frontUri, profileUri });
        setScans((prev) => {
          const next: Scan = {
            id: `scan-${Date.now()}`,
            date: new Date().toISOString(),
            scores: result.scores,
            photoUri: frontUri,
          };
          return firstRealScanDone.current ? [next, ...prev] : [next];
        });
        firstRealScanDone.current = true;
        setHasRealScan(true);
      } catch (e) {
        setScanError(e instanceof Error ? e.message : 'Scan failed');
        throw e;
      } finally {
        setScanning(false);
      }
    },
    [],
  );

  const value = useMemo<ScanValue>(() => {
    const latest = scans[0] ?? placeholderScan();
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
      scanning,
      scanError,
      hasRealScan,
      runScan,
    };
  }, [scans, rescan, scanning, scanError, hasRealScan, runScan, mountNow]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScans() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScans must be used within ScanProvider');
  return ctx;
}