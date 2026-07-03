import React from 'react';
import { SkinGlyph, colors } from 'looxmaxxing';

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
    <SkinGlyph color={colors.textPrimary} />
    <SkinGlyph color={colors.textSecondary} />
    <SkinGlyph color={colors.primary} />
    <SkinGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <SkinGlyph color={colors.textPrimary} size={16} />
    <SkinGlyph color={colors.textPrimary} size={24} />
    <SkinGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
