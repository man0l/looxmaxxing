import React from 'react';
import { GalleryIcon, colors } from 'looxmaxxing';

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
    <GalleryIcon color={colors.textPrimary} />
    <GalleryIcon color={colors.textSecondary} />
    <GalleryIcon color={colors.primary} />
    <GalleryIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <GalleryIcon color={colors.textPrimary} size={16} />
    <GalleryIcon color={colors.textPrimary} size={24} />
    <GalleryIcon color={colors.textPrimary} size={40} />
  </Panel>
);
