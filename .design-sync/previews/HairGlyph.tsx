import React from 'react';
import { HairGlyph, colors } from 'looxmaxxing';

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
    <HairGlyph color={colors.textPrimary} />
    <HairGlyph color={colors.textSecondary} />
    <HairGlyph color={colors.primary} />
    <HairGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <HairGlyph color={colors.textPrimary} size={16} />
    <HairGlyph color={colors.textPrimary} size={24} />
    <HairGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
