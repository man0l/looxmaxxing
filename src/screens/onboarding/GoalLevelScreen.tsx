import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { GoalLevel } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';

// Effort levels, not rank tiers. These were "Top 30% / 10% / 1% of men", which
// asked the user to pick a position relative to other people — the framing App
// Review cited under guideline 1.1.1. The GoalLevel keys are unchanged so stored
// onboarding state stays valid.
const OPTIONS: { value: GoalLevel; label: string; detail: string }[] = [
  { value: 'mtn', label: 'Keep it simple', detail: 'A few minutes, most days' },
  { value: 'htn', label: 'Build a solid routine', detail: 'Daily basics, consistently' },
  { value: 'chadlite', label: 'Go further', detail: 'Full routine plus workouts' },
  { value: 'chad', label: 'All in', detail: 'Every session, every day' },
];

interface Props {
  selected: GoalLevel | null;
  onSelect: (v: GoalLevel) => void;
  onContinue: () => void;
}

export function GoalLevelScreen({ selected, onSelect, onContinue }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <OnboardingProgressBar current={7} />
      <Text style={styles.title}>How much do you want to take on?</Text>
      <Text style={styles.subtitle}>This sets how demanding your personalized plan is.</Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillDefault]}
            >
              <View style={styles.pillBody}>
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {opt.label}
                </Text>
                <Text style={[styles.pillDetail, isActive && styles.pillDetailActive]}>
                  {opt.detail}
                </Text>
              </View>
              {isActive && <Text style={styles.check}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onContinue}
          style={[styles.cta, !selected && styles.ctaDisabled]}
          disabled={!selected}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.sm,
    flex: 1,
  },
  pill: {
    borderRadius: radii.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillDefault: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.tertiary,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  pillBody: {
    flex: 1,
    gap: 2,
  },
  pillText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.onTertiary,
    fontWeight: '600',
  },
  pillDetail: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  pillDetailActive: {
    color: colors.onTertiary,
    opacity: 0.7,
  },
  check: {
    fontSize: 16,
    color: colors.onTertiary,
  },
  footer: {
    marginTop: spacing.xxl,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
