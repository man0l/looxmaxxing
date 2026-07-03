import React from 'react';
import { BlurredTraitGrid, colors } from 'looxmaxxing';

export const PaywallTease = () => (
  <div style={{ background: colors.background, padding: 20, borderRadius: 22, maxWidth: 400 }}>
    <BlurredTraitGrid concerns={['jawline', 'skin']} />
  </div>
);
