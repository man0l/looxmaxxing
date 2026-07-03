import React from 'react';
import { AvatarsIcon, colors } from 'looxmaxxing';

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
    <AvatarsIcon color={colors.textPrimary} />
    <AvatarsIcon color={colors.textSecondary} />
    <AvatarsIcon color={colors.primary} />
    <AvatarsIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <AvatarsIcon color={colors.textPrimary} size={16} />
    <AvatarsIcon color={colors.textPrimary} size={24} />
    <AvatarsIcon color={colors.textPrimary} size={40} />
  </Panel>
);
