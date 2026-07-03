import React from 'react';
import { MasculinityGlyph, colors } from 'looxmaxxing';

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
    <MasculinityGlyph color={colors.textPrimary} />
    <MasculinityGlyph color={colors.textSecondary} />
    <MasculinityGlyph color={colors.primary} />
    <MasculinityGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <MasculinityGlyph color={colors.textPrimary} size={16} />
    <MasculinityGlyph color={colors.textPrimary} size={24} />
    <MasculinityGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
