import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPlanItem, taskIdsForItem } from '../types/practice';
import { dateKey } from '../services/streak';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

interface PracticeValue {
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  doneCountForTrait: (traitId: string) => number;
  totalCountForTrait: (traitId: string) => number;
}

interface PracticeStore {
  day: string;
  completed: Record<string, boolean>;
}

const PracticeContext = createContext<PracticeValue>({
  isDone: () => false,
  toggle: () => {},
  doneCountForTrait: () => 0,
  totalCountForTrait: () => 0,
});

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [day, setDay] = useState(() => dateKey(new Date()));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const today = dateKey(new Date());
    loadJson<PracticeStore>(STORAGE_KEYS.practice).then((saved) => {
      if (saved?.day === today) {
        setCompleted(saved.completed);
        setDay(today);
      } else {
        setCompleted({});
        setDay(today);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const today = dateKey(new Date());
    if (today !== day) {
      const timer = setTimeout(() => {
        setDay(today);
        setCompleted({});
      }, 0);
      return () => clearTimeout(timer);
    }
    saveJson(STORAGE_KEYS.practice, { day, completed } satisfies PracticeStore);
  }, [completed, day, hydrated]);

  const isDone = useCallback((id: string) => completed[id] === true, [completed]);

  const toggle = useCallback(
    (id: string) => {
      const today = dateKey(new Date());
      if (today !== day) {
        setDay(today);
        setCompleted({ [id]: true });
        return;
      }
      setCompleted((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = true;
        return next;
      });
    },
    [day],
  );

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
    () => ({ isDone, toggle, doneCountForTrait, totalCountForTrait }),
    [isDone, toggle, doneCountForTrait, totalCountForTrait],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  return useContext(PracticeContext);
}