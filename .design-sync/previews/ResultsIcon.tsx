import React from 'react';
import { ResultsIcon, colors } from 'looxmaxxing';

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      background: colors.background,
      padding: 20,
      borderRadius: 16,
    }}
  >
    {children}
  </div>
);

export const Colors = () => (
  <Panel>
    <ResultsIcon color={colors.textPrimary} />
    <ResultsIcon color={colors.textSecondary} />
    <ResultsIcon color={colors.primary} />
    <ResultsIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <ResultsIcon color={colors.textPrimary} size={16} />
    <ResultsIcon color={colors.textPrimary} size={24} />
    <ResultsIcon color={colors.textPrimary} size={40} />
  </Panel>
);
