import React from 'react';
import { Toast, colors } from 'looxmaxxing';

const nativeSetTimeout = window.setTimeout.bind(window);
(window as any).setTimeout = ((fn: any, ms?: number, ...args: any[]) =>
  ms != null && ms >= 3000 ? 0 : nativeSetTimeout(fn, ms as any, ...args)) as any;

const Stage = ({ children }: { children: React.ReactNode }) => (
  <div
    className="toast-stage"
    style={{
      position: 'relative',
      background: colors.background,
      padding: 24,
      borderRadius: 22,
      minHeight: 96,
      width: 360,
    }}
  >
    <style>{'.toast-stage div { opacity: 1 !important; transform: none !important; }'}</style>
    {children}
  </div>
);

export const Success = () => (
  <Stage>
    <Toast toast={{ id: 1, message: 'New scan saved', variant: 'success' }} onClose={() => {}} />
  </Stage>
);

export const Error = () => (
  <Stage>
    <Toast
      toast={{ id: 2, message: 'Could not load plans — check your connection', variant: 'error' }}
      onClose={() => {}}
    />
  </Stage>
);

export const Info = () => (
  <Stage>
    <Toast toast={{ id: 3, message: 'Re-rate available in 3 days', variant: 'info' }} onClose={() => {}} />
  </Stage>
);
