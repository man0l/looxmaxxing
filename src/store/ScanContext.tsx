import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Scan } from '../types/scan';
import { getScores, improveScores } from '../services/scoring';
import { submitScan } from '../services/api';
import { getAppUserID } from '../services/purchases';
import { registerLocalDataReset } from '../services/dataDeletion';
import { registerScanPhotoClear, unregisterScanPhotoClear } from '../services/photoDeletion';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

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
  rescan: (photoUri?: string) => void;
  scanning: boolean;
  scanError: string | null;
  hasRealScan: boolean;
  runScan: (photos: { frontUri: string; profileUri?: string }) => Promise<void>;
}

const ScanContext = createContext<ScanValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<Scan[]>([]);
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

  const clearScanPhotos = useCallback(() => {
    setScans((prev) => {
      if (!prev.some((scan) => scan.photoUri)) return prev;
      return prev.map(({ photoUri: _uri, ...scan }) => scan);
    });
  }, []);

  const clearAllScans = useCallback(() => {
    setScans([]);
    setHasRealScan(false);
    setScanError(null);
    setScanning(false);
    firstRealScanDone.current = false;
  }, []);

  useEffect(() => {
    registerScanPhotoClear(clearScanPhotos);
    return unregisterScanPhotoClear;
  }, [clearScanPhotos]);

  useEffect(() => {
    return registerLocalDataReset(clearAllScans);
  }, [clearAllScans]);

  const rescan = useCallback((photoUri?: string) => {
    setScans((prev) => {
      const base = prev[0] ?? placeholderScan();
      const next: Scan = {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        scores: improveScores(base.scores),
        photoUri,
      };
      return [next, ...prev];
    });
    setHasRealScan(true);
    firstRealScanDone.current = true;
  }, []);

  const runScan = useCallback(
    async ({ frontUri, profileUri }: { frontUri: string; profileUri?: string }) => {
      setScanning(true);
      setScanError(null);
      const controller = new AbortController();
      // A plain foreground request can get silently killed by iOS once the
      // process is suspended for a while, leaving the fetch promise neither
      // resolved nor rejected — which otherwise shows as an endless
      // "Analyzing your photos" screen when the user comes back. Abort our
      // own request on backgrounding so it fails fast with a clear retry.
      let backgrounded = false;
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'background') {
          backgrounded = true;
          controller.abort();
        }
      });
      try {
        const appUserId = await getAppUserID();
        const result = await submitScan({ appUserId, frontUri, profileUri, signal: controller.signal });
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
        const message = backgrounded
          ? 'Connection interrupted while the app was in the background. Please try again.'
          : e instanceof Error
            ? e.message
            : 'Scan failed';
        if (__DEV__) {
          rescan(frontUri);
          setScanError(null);
          return;
        }
        setScanError(message);
        throw e;
      } finally {
        setScanning(false);
        sub.remove();
      }
    },
    [rescan],
  );

  const value = useMemo<ScanValue>(() => {
    const latest = scans[0] ?? placeholderScan();
    return {
      scans,
      latest,
      canRescan: hasRealScan,
      rescan,
      scanning,
      scanError,
      hasRealScan,
      runScan,
    };
  }, [scans, rescan, scanning, scanError, hasRealScan, runScan]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScans() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScans must be used within ScanProvider');
  return ctx;
}