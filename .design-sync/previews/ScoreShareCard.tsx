import React from 'react';
import { ScoreShareCard } from 'looxmaxxing';

const ROWS = [
  { label: 'Jawline', percentile: 61 },
  { label: 'Cheekbones', percentile: 47 },
  { label: 'Skin', percentile: 38 },
  { label: 'Hair', percentile: 72 },
  { label: 'Masculinity', percentile: 55 },
  { label: 'Smile', percentile: 64 },
  { label: 'Eyes', percentile: 51 },
];

export const LatestScan = () => <ScoreShareCard overall="5.5" rows={ROWS} />;

export const WithDelta = () => <ScoreShareCard overall="6.1" rows={ROWS} overallDelta="+0.6" />;
