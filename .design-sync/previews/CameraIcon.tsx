import React from 'react';
import { CameraIcon, colors } from 'looxmaxxing';

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
    <CameraIcon color={colors.textPrimary} />
    <CameraIcon color={colors.textSecondary} />
    <CameraIcon color={colors.primary} />
    <CameraIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <CameraIcon color={colors.textPrimary} size={16} />
    <CameraIcon color={colors.textPrimary} size={24} />
    <CameraIcon color={colors.textPrimary} size={40} />
  </Panel>
);
