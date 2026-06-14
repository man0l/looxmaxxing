export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
