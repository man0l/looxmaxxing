import React from 'react';
import { CompareIcon, colors } from 'looxmaxxing';

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
    <CompareIcon color={colors.textPrimary} />
    <CompareIcon color={colors.textSecondary} />
    <CompareIcon color={colors.primary} />
    <CompareIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <CompareIcon color={colors.textPrimary} size={16} />
    <CompareIcon color={colors.textPrimary} size={24} />
    <CompareIcon color={colors.textPrimary} size={40} />
  </Panel>
);
