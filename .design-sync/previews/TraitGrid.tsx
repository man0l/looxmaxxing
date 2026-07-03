import React from 'react';
import { TraitGrid, getScores, colors } from 'looxmaxxing';

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: colors.background,
      padding: 20,
      borderRadius: 22,
      maxWidth: 400,
    }}
  >
    {children}
  </div>
);

export const ConcernsFirst = () => (
  <Screen>
    <TraitGrid concerns={['jawline', 'skin']} scores={getScores()} onOpenPlan={() => {}} />
  </Screen>
);

export const SingleConcern = () => (
  <Screen>
    <TraitGrid concerns={['hair']} scores={getScores()} onOpenPlan={() => {}} />
  </Screen>
);
