import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { registerLocalDataReset } from '../services/dataDeletion';
import { setAiShareGranted } from '../services/aiShareConsent';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

interface Store {
  granted: boolean;
}

interface AiShareConsentValue {
  ready: boolean;
  granted: boolean;
  grant: () => void;
  withdraw: () => void;
}

const AiShareConsentContext = createContext<AiShareConsentValue | null>(null);

export function AiShareConsentProvider({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const grantedRef = useRef(false);

  useEffect(() => {
    loadJson<Store>(STORAGE_KEYS.aiShareConsent).then((saved) => {
      if (grantedRef.current) {
        setHydrated(true);
        return;
      }
      const next = Boolean(saved?.granted);
      setAiShareGranted(next);
      grantedRef.current = next;
      setGranted(next);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    return registerLocalDataReset(() => {
      grantedRef.current = false;
      setAiShareGranted(false);
      setGranted(false);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_KEYS.aiShareConsent, { granted } satisfies Store);
  }, [granted, hydrated]);

  const grant = useCallback(() => {
    grantedRef.current = true;
    setAiShareGranted(true);
    setGranted(true);
  }, []);

  const withdraw = useCallback(() => {
    grantedRef.current = false;
    setAiShareGranted(false);
    setGranted(false);
  }, []);

  const value = useMemo<AiShareConsentValue>(
    () => ({ ready: hydrated, granted, grant, withdraw }),
    [hydrated, granted, grant, withdraw],
  );

  return <AiShareConsentContext.Provider value={value}>{children}</AiShareConsentContext.Provider>;
}

export function useAiShareConsent() {
  const ctx = useContext(AiShareConsentContext);
  if (!ctx) throw new Error('useAiShareConsent must be used within AiShareConsentProvider');
  return ctx;
}
