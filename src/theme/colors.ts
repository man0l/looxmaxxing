export const colors = {
  primary: '#3D6BE6',
  onPrimary: '#FFFFFF',
  secondary: '#C99E6F',
  onSecondary: '#2A1D10',
  tertiary: '#EFE6D8',
  onTertiary: '#1C150D',
  accent: '#F25430',
  onAccent: '#FFFFFF',
  danger: '#E5483D',
  background: '#15100B',
  backgroundGradientEnd: '#0E0B07',
  surface: '#241B12',
  surfaceRaised: '#2E2418',
  surfaceInset: '#1A140D',
  border: '#3A2F21',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9285',
  textTertiary: '#6E6657',
} as const;

export type ColorToken = keyof typeof colors;
