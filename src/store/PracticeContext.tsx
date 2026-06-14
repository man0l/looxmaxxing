import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getPlanItem, taskIdsForItem } from '../types/practice';

interface PracticeValue {
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  doneCountForTrait: (traitId: string) => number;
  totalCountForTrait: (traitId: string) => number;
}

const PracticeContext = createContext<PracticeValue>({
  isDone: () => false,
  toggle: () => {},
  doneCountForTrait: () => 0,
  totalCountForTrait: () => 0,
});

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const isDone = useCallback((id: string) => completed[id] === true, [completed]);

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
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
    () => ({ isDone, toggle, doneCountForTrait, totalCountForTrait }),
    [isDone, toggle, doneCountForTrait, totalCountForTrait],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  return useContext(PracticeContext);
}
