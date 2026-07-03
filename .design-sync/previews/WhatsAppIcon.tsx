import React from 'react';
import { WhatsAppIcon, colors } from 'looxmaxxing';

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
    <WhatsAppIcon color={colors.textPrimary} />
    <WhatsAppIcon color={colors.textSecondary} />
    <WhatsAppIcon color={colors.primary} />
    <WhatsAppIcon color={colors.tertiary} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <WhatsAppIcon color={colors.textPrimary} size={16} />
    <WhatsAppIcon color={colors.textPrimary} size={24} />
    <WhatsAppIcon color={colors.textPrimary} size={40} />
  </Panel>
);
