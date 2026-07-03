import React from 'react';
import { CheekbonesGlyph, colors } from 'looxmaxxing';

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
    <CheekbonesGlyph color={colors.textPrimary} />
    <CheekbonesGlyph color={colors.textSecondary} />
    <CheekbonesGlyph color={colors.primary} />
    <CheekbonesGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <CheekbonesGlyph color={colors.textPrimary} size={16} />
    <CheekbonesGlyph color={colors.textPrimary} size={24} />
    <CheekbonesGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
