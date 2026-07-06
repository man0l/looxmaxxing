import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { AgeRange } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';

const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: 'under17', label: 'Under 17' },
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45+', label: '45+' },
];

interface Props {
  selected: AgeRange | null;
  onSelect: (age: AgeRange) => void;
  onContinue: () => void;
  onUnder17: () => void;
}

export function AgeGateScreen({ selected, onSelect, onContinue, onUnder17 }: Props) {
  const handleSelect = (age: AgeRange) => {
    onSelect(age);
    if (age === 'under17') {
      onUnder17();
      return;
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <OnboardingProgressBar current={2} />
      <Text style={styles.title}>How old are you?</Text>
      <Text style={styles.subtitle}>Used only to calibrate your plan.</Text>

      <View style={styles.options}>
        {AGE_RANGES.map((range) => {
          const isActive = selected === range.value;
          return (
            <Pressable
              key={range.value}
              onPress={() => handleSelect(range.value)}
              style={[
                styles.pill,
                isActive ? styles.pillActive : styles.pillDefault,
              ]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {range.label}
              </Text>
              {isActive && <Text style={styles.checkmark}>✓</Text>}
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
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.sm,
  },
  pill: {
    borderRadius: radii.full,
    paddingVertical: 12,
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
  checkmark: {
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
