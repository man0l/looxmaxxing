import React from 'react';
import { ShareIcon, colors } from 'looxmaxxing';

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
    <ShareIcon color={colors.textPrimary} />
    <ShareIcon color={colors.textSecondary} />
    <ShareIcon color={colors.primary} />
    <ShareIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <ShareIcon color={colors.textPrimary} size={16} />
    <ShareIcon color={colors.textPrimary} size={24} />
    <ShareIcon color={colors.textPrimary} size={40} />
  </Panel>
);
