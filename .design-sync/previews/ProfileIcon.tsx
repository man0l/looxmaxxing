import React from 'react';
import { ProfileIcon, colors } from 'looxmaxxing';

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
    <ProfileIcon color={colors.textPrimary} />
    <ProfileIcon color={colors.textSecondary} />
    <ProfileIcon color={colors.primary} />
    <ProfileIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <ProfileIcon color={colors.textPrimary} size={16} />
    <ProfileIcon color={colors.textPrimary} size={24} />
    <ProfileIcon color={colors.textPrimary} size={40} />
  </Panel>
);
