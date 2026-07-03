import React from 'react';
import { EyesGlyph, colors } from 'looxmaxxing';

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
    <EyesGlyph color={colors.textPrimary} />
    <EyesGlyph color={colors.textSecondary} />
    <EyesGlyph color={colors.primary} />
    <EyesGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <EyesGlyph color={colors.textPrimary} size={16} />
    <EyesGlyph color={colors.textPrimary} size={24} />
    <EyesGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
