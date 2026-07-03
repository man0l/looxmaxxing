import React from 'react';
import { CaptureFab, colors } from 'looxmaxxing';

const Stage = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: 'relative',
      background: colors.background,
      borderRadius: 22,
      width: 240,
      height: 140,
    }}
  >
    {children}
  </div>
);

export const Default = () => (
  <Stage>
    <CaptureFab onPress={() => {}} />
  </Stage>
);

export const Disabled = () => (
  <Stage>
    <CaptureFab onPress={() => {}} disabled />
  </Stage>
);
