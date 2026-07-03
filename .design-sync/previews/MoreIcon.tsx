import React from 'react';
import { MoreIcon, colors } from 'looxmaxxing';

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
    <MoreIcon color={colors.textPrimary} />
    <MoreIcon color={colors.textSecondary} />
    <MoreIcon color={colors.primary} />
    <MoreIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <MoreIcon color={colors.textPrimary} size={16} />
    <MoreIcon color={colors.textPrimary} size={24} />
    <MoreIcon color={colors.textPrimary} size={40} />
  </Panel>
);
