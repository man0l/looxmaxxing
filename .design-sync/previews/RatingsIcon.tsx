import React from 'react';
import { RatingsIcon, colors } from 'looxmaxxing';

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
    <RatingsIcon color={colors.textPrimary} />
    <RatingsIcon color={colors.textSecondary} />
    <RatingsIcon color={colors.primary} />
    <RatingsIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <RatingsIcon color={colors.textPrimary} size={16} />
    <RatingsIcon color={colors.textPrimary} size={24} />
    <RatingsIcon color={colors.textPrimary} size={40} />
  </Panel>
);
