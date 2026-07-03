import React from 'react';
import { SmileGlyph, colors } from 'looxmaxxing';

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
    <SmileGlyph color={colors.textPrimary} />
    <SmileGlyph color={colors.textSecondary} />
    <SmileGlyph color={colors.primary} />
    <SmileGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <SmileGlyph color={colors.textPrimary} size={16} />
    <SmileGlyph color={colors.textPrimary} size={24} />
    <SmileGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
