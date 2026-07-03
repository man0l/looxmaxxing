import React from 'react';
import { ConcernGlyph, colors } from 'looxmaxxing';

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

export const AllConcerns = () => (
  <Panel>
    {['jawline', 'cheekbones', 'skin', 'hair', 'masculinity', 'smile', 'eyes'].map((id) => (
      <ConcernGlyph key={id} id={id} color={colors.tertiary} size={28} />
    ))}
  </Panel>
);
