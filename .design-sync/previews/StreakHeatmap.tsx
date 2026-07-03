import React from 'react';
import { StreakHeatmap, buildHeatmap, seedHistory, colors } from 'looxmaxxing';

export const TwelveWeeks = () => (
  <div style={{ background: colors.background, padding: 20, borderRadius: 22, display: 'inline-block' }}>
    <StreakHeatmap weeks={buildHeatmap(seedHistory(), 2, 12)} />
  </div>
);

export const AllDoneToday = () => (
  <div style={{ background: colors.background, padding: 20, borderRadius: 22, display: 'inline-block' }}>
    <StreakHeatmap weeks={buildHeatmap(seedHistory(), 4, 12)} />
  </div>
);
