import React from 'react';
import { ScoreTimeline, colors } from 'looxmaxxing';

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: colors.background, padding: 20, borderRadius: 22, width: 360 }}>
    {children}
  </div>
);

export const Improving = () => (
  <Screen>
    <ScoreTimeline
      points={[
        { date: '2026-05-04', percentile: 45 },
        { date: '2026-05-19', percentile: 42 },
        { date: '2026-06-14', percentile: 39 },
        { date: '2026-07-01', percentile: 35 },
      ]}
    />
  </Screen>
);

export const HoldingSteady = () => (
  <Screen>
    <ScoreTimeline
      points={[
        { date: '2026-06-14', percentile: 51 },
        { date: '2026-07-01', percentile: 51 },
      ]}
    />
  </Screen>
);

export const NotEnoughScans = () => (
  <Screen>
    <ScoreTimeline points={[{ date: '2026-07-01', percentile: 39 }]} emptyHint="Re-rate in 14 days to start your timeline" />
  </Screen>
);
