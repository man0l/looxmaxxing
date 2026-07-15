import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { ObstacleAnswer } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';

const OPTIONS: { value: ObstacleAnswer; label: string }[] = [
  { value: 'no_direction', label: "Didn't know where to start" },
  { value: 'no_routine', label: 'No consistent routine' },
  { value: 'didnt_work', label: "Tried things that didn't work" },
  { value: 'just_discovered', label: 'Just discovered this matters' },
];

interface Props {
  selected: ObstacleAnswer | null;
  onSelect: (v: ObstacleAnswer) => void;
  onContinue: () => void;
}

export function ObstacleScreen({ selected, onSelect, onContinue }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <OnboardingProgressBar current={4} />
      <Text style={styles.title}>{"What's held you back\nfrom improving?"}</Text>
      <Text style={styles.subtitle}>We&apos;ll tailor your plan around it.</Text>

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
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
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
