import React from 'react';
import { XIcon, colors } from 'looxmaxxing';

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
    <XIcon color={colors.textPrimary} />
    <XIcon color={colors.textSecondary} />
    <XIcon color={colors.primary} />
    <XIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <XIcon color={colors.textPrimary} size={16} />
    <XIcon color={colors.textPrimary} size={24} />
    <XIcon color={colors.textPrimary} size={40} />
  </Panel>
);
