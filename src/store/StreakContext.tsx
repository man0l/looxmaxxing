import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPlanItem, taskIdsForItem, type PlanItem } from '../types/practice';
import { useOnboarding } from './OnboardingContext';
import { usePractice } from './PracticeContext';
import {
  buildHeatmap,
  currentStreakDay,
  dateKey,
  longestStreak,
  nextMilestone,
  reachedMilestone,
  type HeatCell,
} from '../services/streak';
import { registerLocalDataReset } from '../services/dataDeletion';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

const HEATMAP_WEEKS = 14;

interface StreakValue {
  currentDay: number;
  longest: number;
  tasksDoneToday: number;
  tasksTotalToday: number;
  tasksLeftToday: number;
  reached: number | null;
  next: number | null;
  heatmap: HeatCell[][];
  freezeAvailable: boolean;
  useFreeze: () => void;
}

interface StreakStore {
  history: Record<string, number>;
  freezeUsedForMonth: string | null;
}

function monthKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const StreakContext = createContext<StreakValue | null>(null);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const { concerns } = useOnboarding();
  const { isDone } = usePractice();
  const [history, setHistory] = useState<Record<string, number>>({});
  const [freezeUsedForMonth, setFreezeUsedForMonth] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadJson<StreakStore>(STORAGE_KEYS.streak).then((saved) => {
      if (saved) {
        setHistory(saved.history);
        setFreezeUsedForMonth(saved.freezeUsedForMonth);
      }
      setHydrated(true);
    });
  }, []);

  const planItems = useMemo(
    () => concerns.map(getPlanItem).filter((i): i is PlanItem => i !== undefined),
    [concerns],
  );
  const taskIds = useMemo(() => planItems.flatMap(taskIdsForItem), [planItems]);
  const tasksTotalToday = taskIds.length;
  const tasksDoneToday = taskIds.filter(isDone).length;
  const todayKey = dateKey(new Date());

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      setHistory((prev) => {
        const existing = prev[todayKey];
        if (tasksDoneToday > 0) {
          if (existing === tasksDoneToday) return prev;
          return { ...prev, [todayKey]: tasksDoneToday };
        }
        if (existing === undefined) return prev;
        const next = { ...prev };
        delete next[todayKey];
        return next;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [tasksDoneToday, todayKey, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_KEYS.streak, { history, freezeUsedForMonth } satisfies StreakStore);
  }, [history, freezeUsedForMonth, hydrated]);

  useEffect(() => {
    return registerLocalDataReset(() => {
      setHistory({});
      setFreezeUsedForMonth(null);
    });
  }, []);

  const useFreeze = useCallback(() => setFreezeUsedForMonth(monthKey()), []);

  const value = useMemo<StreakValue>(() => {
    const todayActive = tasksDoneToday > 0;
    const currentDay = currentStreakDay(history);
    return {
      currentDay,
      longest: longestStreak(history, todayActive),
      tasksDoneToday,
      tasksTotalToday,
      tasksLeftToday: Math.max(0, tasksTotalToday - tasksDoneToday),
      reached: reachedMilestone(currentDay),
      next: nextMilestone(currentDay),
      heatmap: buildHeatmap(history, tasksDoneToday, HEATMAP_WEEKS),
      freezeAvailable: freezeUsedForMonth !== monthKey(),
      useFreeze,
    };
  }, [history, freezeUsedForMonth, useFreeze, tasksDoneToday, tasksTotalToday]);

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
}