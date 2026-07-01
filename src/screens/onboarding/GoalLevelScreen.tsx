import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { GoalLevel } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';

const OPTIONS: { value: GoalLevel; label: string }[] = [
  { value: 'mtn', label: 'MTN (Mid-Tier Normie)' },
  { value: 'htn', label: 'HTN (High-Tier Normie)' },
  { value: 'chadlite', label: 'Chadlite — Strong Jawline' },
  { value: 'chad', label: 'Chad — Top 1%' },
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
      <Text style={styles.title}>Which level do you hope to reach?</Text>
      <Text style={styles.subtitle}>This sets the target for your personalized plan.</Text>

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
    backgroundColor: colors.background,
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
