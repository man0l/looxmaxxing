import React from 'react';
import { AvatarRender, colors } from 'looxmaxxing';

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      background: colors.background,
      padding: 20,
      borderRadius: 22,
    }}
  >
    {children}
  </div>
);

export const TraitRenders = () => (
  <Panel>
    <AvatarRender traitId="jawline" />
    <AvatarRender traitId="skin" />
    <AvatarRender traitId="hair" />
  </Panel>
);

export const WithStyleChip = () => (
  <Panel>
    <AvatarRender traitId="jawline" style="Defined" size={180} />
  </Panel>
);

export const Small = () => (
  <Panel>
    <AvatarRender traitId="eyes" size={96} />
  </Panel>
);
