import { useCallback, useState } from 'react';
import { usePractice } from '../store/PracticeContext';
import { useStreak } from '../store/StreakContext';

export function useDayCompleteMoment() {
  const { complete, isDone } = usePractice();
  const { tasksLeftToday, tasksTotalToday } = useStreak();
  const [visible, setVisible] = useState(false);

  const completeTask = useCallback(
    (id: string) => {
      if (isDone(id)) return;
      const completesDay = tasksLeftToday === 1 && tasksTotalToday > 0;
      complete(id);
      if (completesDay) setVisible(true);
    },
    [complete, isDone, tasksLeftToday, tasksTotalToday],
  );

  const dismiss = useCallback(() => setVisible(false), []);

  return { completeTask, visible, dismiss };
}