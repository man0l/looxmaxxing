import React from 'react';
import { PracticeIcon, colors } from 'looxmaxxing';

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
    <PracticeIcon color={colors.textPrimary} />
    <PracticeIcon color={colors.textSecondary} />
    <PracticeIcon color={colors.primary} />
    <PracticeIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <PracticeIcon color={colors.textPrimary} size={16} />
    <PracticeIcon color={colors.textPrimary} size={24} />
    <PracticeIcon color={colors.textPrimary} size={40} />
  </Panel>
);
