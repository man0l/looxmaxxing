import { fonts } from './fonts';

export const typography = {
  display: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 28 * 1.15,
    letterSpacing: -0.01,
  },
  h2: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 18 * 1.25,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 16 * 1.3,
  },
  bodyMd: {
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 15 * 1.45,
  },
  bodySm: {
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 13 * 1.4,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 13 * 1.2,
  },
  stat: {
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 17 * 1.1,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 11 * 1.3,
    letterSpacing: 0.01,
  },
} as const;

export type TypographyToken = keyof typeof typography;
