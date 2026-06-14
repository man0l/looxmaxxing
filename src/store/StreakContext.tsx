import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getPlanItem, taskIdsForItem, type PlanItem } from '../types/practice';
import { useOnboarding } from './OnboardingContext';
import { usePractice } from './PracticeContext';
import {
  buildHeatmap,
  currentStreakDay,
  longestStreak,
  nextMilestone,
  reachedMilestone,
  seedHistory,
  type HeatCell,
} from '../services/streak';

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

const StreakContext = createContext<StreakValue | null>(null);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const { concerns } = useOnboarding();
  const { isDone } = usePractice();
  const [history] = useState(seedHistory);
  const [freezeUsed, setFreezeUsed] = useState(false);

  const useFreeze = useCallback(() => setFreezeUsed(true), []);

  const value = useMemo<StreakValue>(() => {
    const planItems = concerns
      .map(getPlanItem)
      .filter((i): i is PlanItem => i !== undefined);
    const taskIds = planItems.flatMap(taskIdsForItem);
    const tasksTotalToday = taskIds.length;
    const tasksDoneToday = taskIds.filter(isDone).length;
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
      freezeAvailable: !freezeUsed,
      useFreeze,
    };
  }, [concerns, isDone, history, freezeUsed, useFreeze]);

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
}
