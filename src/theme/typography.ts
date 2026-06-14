export const typography = {
  display: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 28 * 1.15,
    letterSpacing: -0.01,
  },
  h2: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 18 * 1.25,
  },
  h3: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 16 * 1.3,
  },
  bodyMd: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 15 * 1.45,
  },
  bodySm: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 13 * 1.4,
  },
  label: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 13 * 1.2,
  },
  stat: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 17 * 1.1,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 11 * 1.3,
    letterSpacing: 0.01,
  },
} as const;

export type TypographyToken = keyof typeof typography;
