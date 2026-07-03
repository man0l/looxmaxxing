import React from 'react';
import { StreakShareCard, buildHeatmap, seedHistory } from 'looxmaxxing';

export const TwelveDayStreak = () => <StreakShareCard day={12} weeks={buildHeatmap(seedHistory(), 2, 12)} />;

export const MilestoneThirty = () => <StreakShareCard day={30} weeks={buildHeatmap(seedHistory(), 4, 12)} />;
