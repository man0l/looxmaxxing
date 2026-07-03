import React from 'react';
import { ShareSheet, StreakShareCard, buildHeatmap, seedHistory, colors } from 'looxmaxxing';

export const SharingStreak = () => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      background: colors.background,
      borderRadius: 22,
      width: 375,
      height: 640,
    }}
  >
    <ShareSheet message="Day 12 of my glow-up" onClose={() => {}}>
      <StreakShareCard day={12} weeks={buildHeatmap(seedHistory(), 2, 12)} />
    </ShareSheet>
  </div>
);
