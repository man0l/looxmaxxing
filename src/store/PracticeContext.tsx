import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { getPlanItem, taskIdsForItem } from '../types/practice';
import { dateKey } from '../services/streak';
import { registerLocalDataReset } from '../services/dataDeletion';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

interface PracticeValue {
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  complete: (id: string) => void;
  doneCountForTrait: (traitId: string) => number;
  totalCountForTrait: (traitId: string) => number;
}

interface PracticeStore {
  day: string;
  completed: Record<string, boolean>;
}

function rolloverIfNeeded(store: PracticeStore): PracticeStore {
  const today = dateKey(new Date());
  if (today === store.day) return store;
  return { day: today, completed: {} };
}

const PracticeContext = createContext<PracticeValue>({
  isDone: () => false,
  toggle: () => {},
  complete: () => {},
  doneCountForTrait: () => 0,
  totalCountForTrait: () => 0,
});

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<PracticeStore>(() => ({
    day: dateKey(new Date()),
    completed: {},
  }));
  const [hydrated, setHydrated] = useState(false);
  const { completed } = store;

  useEffect(() => {
    const today = dateKey(new Date());
    loadJson<PracticeStore>(STORAGE_KEYS.practice).then((saved) => {
      if (saved?.day === today) {
        setStore({ day: today, completed: saved.completed });
      } else {
        setStore({ day: today, completed: {} });
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const sync = () => setStore((prev) => rolloverIfNeeded(prev));
    sync();
    const interval = setInterval(sync, 60_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_KEYS.practice, store satisfies PracticeStore);
  }, [store, hydrated]);

  useEffect(() => {
    return registerLocalDataReset(() => {
      setStore({ day: dateKey(new Date()), completed: {} });
    });
  }, []);

  const isDone = useCallback((id: string) => completed[id] === true, [completed]);

  const toggle = useCallback((id: string) => {
    setStore((prev) => {
      const base = rolloverIfNeeded(prev);
      const next = { ...base.completed };
      if (next[id]) delete next[id];
      else next[id] = true;
      return { day: base.day, completed: next };
    });
  }, []);

  const complete = useCallback((id: string) => {
    setStore((prev) => {
      const base = rolloverIfNeeded(prev);
      if (base.completed[id]) return base;
      return { day: base.day, completed: { ...base.completed, [id]: true } };
    });
  }, []);

  const totalCountForTrait = useCallback((traitId: string) => {
    const item = getPlanItem(traitId);
    return item ? taskIdsForItem(item).length : 0;
  }, []);

  const doneCountForTrait = useCallback(
    (traitId: string) => {
      const item = getPlanItem(traitId);
      if (!item) return 0;
      return taskIdsForItem(item).filter((id) => completed[id]).length;
    },
    [completed],
  );

  const value = useMemo(
    () => ({ isDone, toggle, complete, doneCountForTrait, totalCountForTrait }),
    [isDone, toggle, complete, doneCountForTrait, totalCountForTrait],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  return useContext(PracticeContext);
}