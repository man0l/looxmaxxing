import React from 'react';
import { TikTokIcon, colors } from 'looxmaxxing';

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
    <TikTokIcon color={colors.textPrimary} />
    <TikTokIcon color={colors.textSecondary} />
    <TikTokIcon color={colors.primary} />
    <TikTokIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <TikTokIcon color={colors.textPrimary} size={16} />
    <TikTokIcon color={colors.textPrimary} size={24} />
    <TikTokIcon color={colors.textPrimary} size={40} />
  </Panel>
);
