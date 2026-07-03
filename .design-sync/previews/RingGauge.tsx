import React from 'react';
import { RingGauge, colors } from 'looxmaxxing';

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      background: colors.background,
      padding: 24,
      borderRadius: 22,
    }}
  >
    {children}
  </div>
);

export const Percentiles = () => (
  <Panel>
    <RingGauge percentile={72} />
    <RingGauge percentile={51} />
    <RingGauge percentile={38} />
  </Panel>
);

export const Sizes = () => (
  <Panel>
    <RingGauge percentile={61} size={56} />
    <RingGauge percentile={61} size={88} />
    <RingGauge percentile={61} size={120} />
  </Panel>
);

export const WithCenterLabel = () => (
  <Panel>
    <RingGauge percentile={61} size={96} centerLabel="6.1" />
    <RingGauge percentile={47} size={96} centerLabel="5.2" />
  </Panel>
);

export const Obscured = () => (
  <Panel>
    <RingGauge percentile={61} size={96} obscured centerLabel="6.1" />
  </Panel>
);
