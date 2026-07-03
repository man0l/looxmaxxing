import React from 'react';
import { JawlineGlyph, colors } from 'looxmaxxing';

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
    <JawlineGlyph color={colors.textPrimary} />
    <JawlineGlyph color={colors.textSecondary} />
    <JawlineGlyph color={colors.primary} />
    <JawlineGlyph color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <JawlineGlyph color={colors.textPrimary} size={16} />
    <JawlineGlyph color={colors.textPrimary} size={24} />
    <JawlineGlyph color={colors.textPrimary} size={40} />
  </Panel>
);
