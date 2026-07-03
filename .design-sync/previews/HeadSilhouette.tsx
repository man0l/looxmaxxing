import React from 'react';
import { HeadSilhouette, colors } from 'looxmaxxing';

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
    <HeadSilhouette color={colors.textPrimary} />
    <HeadSilhouette color={colors.textSecondary} />
    <HeadSilhouette color={colors.primary} />
    <HeadSilhouette color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <HeadSilhouette color={colors.textPrimary} size={16} />
    <HeadSilhouette color={colors.textPrimary} size={24} />
    <HeadSilhouette color={colors.textPrimary} size={40} />
  </Panel>
);
