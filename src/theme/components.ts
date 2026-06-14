import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';

export const components = {
  card: {
    backgroundColor: colors.surface,
    textColor: colors.textPrimary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerPremium: {
    backgroundColor: colors.secondary,
    textColor: colors.onSecondary,
    ...typography.h2,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  cardActionBlue: {
    backgroundColor: colors.primary,
    textColor: colors.onPrimary,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  badgeUrgency: {
    backgroundColor: colors.accent,
    textColor: colors.onAccent,
    ...typography.stat,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  pillSegment: {
    backgroundColor: colors.surfaceRaised,
    textColor: colors.textSecondary,
    ...typography.label,
    borderRadius: radii.full,
    padding: 10,
  },
  pillSegmentSelected: {
    backgroundColor: colors.tertiary,
    textColor: colors.onTertiary,
    ...typography.label,
    borderRadius: radii.full,
    padding: 10,
  },
  inputInset: {
    backgroundColor: colors.surfaceInset,
    textColor: colors.textTertiary,
    ...typography.bodyMd,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  navBar: {
    backgroundColor: colors.surface,
    textColor: colors.textSecondary,
    ...typography.caption,
    height: 76,
  },
  navCenterRaised: {
    backgroundColor: colors.primary,
    textColor: colors.onPrimary,
    borderRadius: radii.full,
    size: 56,
  },
} as const;

export type ComponentToken = keyof typeof components;
