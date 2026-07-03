import React from 'react';
import { RetakeIcon, colors } from 'looxmaxxing';

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
    <RetakeIcon color={colors.textPrimary} />
    <RetakeIcon color={colors.textSecondary} />
    <RetakeIcon color={colors.primary} />
    <RetakeIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <RetakeIcon color={colors.textPrimary} size={16} />
    <RetakeIcon color={colors.textPrimary} size={24} />
    <RetakeIcon color={colors.textPrimary} size={40} />
  </Panel>
);
