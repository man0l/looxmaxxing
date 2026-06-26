import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Scan } from '../types/scan';
import type { TraitScore } from '../types/traits';
import { getScores, improveScores } from '../services/scoring';
import { submitScan } from '../services/api';
import { getAppUserID } from '../services/purchases';

const RESCAN_DAYS = 14;
const DAY_MS = 86400000;

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function seedScans(): Scan[] {
  const oldest = getScores();
  const middle = improveScores(oldest);
  const latest = improveScores(middle);
  const history: { id: string; daysAgo: number; scores: TraitScore[] }[] = [
    { id: 'scan-3', daysAgo: 16, scores: latest },
    { id: 'scan-2', daysAgo: 30, scores: middle },
    { id: 'scan-1', daysAgo: 44, scores: oldest },
  ];
  return history.map((h) => ({ id: h.id, date: dateDaysAgo(h.daysAgo), scores: h.scores }));
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
  const [scans, setScans] = useState<Scan[]>(seedScans);
  const [mountNow] = useState(() => Date.now());
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasRealScan, setHasRealScan] = useState(false);
  const firstRealScanDone = useRef(false);

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

  // Real scan via the API (direct-to-Storage upload → POST /v1/scans). Throws on
  // failure (network, 402 entitlement, API not configured); callers fall back to
  // the local mock `rescan` so the flow always completes. `scanning` drives an
  // analyzing state in the UI during the server-side score.
  const runScan = useCallback(
    async ({ frontUri, profileUri }: { frontUri: string; profileUri: string }) => {
      setScanning(true);
      setScanError(null);
      try {
        const appUserId = await getAppUserID();
        const result = await submitScan({ appUserId, frontUri, profileUri });
        setScans((prev) => {
          const next: Scan = {
            id: `scan-${prev.length + 1}`,
            date: new Date().toISOString(),
            scores: result.scores,
            photoUri: frontUri,
          };
          // First real scan replaces the mock seed history; later scans prepend.
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
