import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { GoalTimeline } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';

const OPTIONS: { value: GoalTimeline; label: string }[] = [
  { value: '2_weeks', label: 'In 2 weeks' },
  { value: '1_month', label: 'In 1 month' },
  { value: '3_months', label: 'In 3 months' },
  { value: 'just_know', label: 'Just want to know where I stand' },
];

interface Props {
  selected: GoalTimeline | null;
  onSelect: (v: GoalTimeline) => void;
  onContinue: () => void;
}

export function GoalTimelineScreen({ selected, onSelect, onContinue }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.step}>Step 5 of 5</Text>
      <Text style={styles.title}>When do you want to see your first results?</Text>
      <Text style={styles.subtitle}>We'll set your re-scan reminder accordingly.</Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillDefault]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {opt.label}
              </Text>
              {isActive && <Text style={styles.check}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onContinue}
        style={[styles.cta, !selected && styles.ctaDisabled]}
        disabled={!selected}
      >
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  step: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.bodySm,
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
  pillText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.onTertiary,
    fontWeight: '600',
  },
  check: {
    fontSize: 16,
    color: colors.onTertiary,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xxl,
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
