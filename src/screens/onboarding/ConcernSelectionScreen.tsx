import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { CONCERNS } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';
import { SHOW_ONBOARDING_STEPS } from '../../config/onboardingSteps';
import { ConcernGlyph } from '../../components/icons/OnboardingIcons';

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}

export function ConcernSelectionScreen({ selected, onToggle, onContinue }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      {SHOW_ONBOARDING_STEPS && <Text style={styles.step}>Step 3 of 10</Text>}
      <Text style={styles.title}>What would you like to work on?</Text>
      <Text style={styles.subtitle}>Most guys pick 2–3. This shapes your plan.</Text>

      <View style={styles.grid}>
        {CONCERNS.map((concern) => {
          const isActive = selected.includes(concern.id);
          return (
            <Pressable
              key={concern.id}
              onPress={() => onToggle(concern.id)}
              style={[styles.card, isActive ? styles.cardActive : styles.cardDefault]}
            >
              <ConcernGlyph
                id={concern.id}
                size={20}
                color={isActive ? colors.onTertiary : colors.textSecondary}
              />
              <Text style={[styles.cardLabel, isActive && styles.cardLabelActive]}>
                {concern.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.counter}>{selected.length} of 3 selected</Text>
        <Pressable
          onPress={onContinue}
          style={[styles.cta, selected.length === 0 && styles.ctaDisabled]}
          disabled={selected.length === 0}
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
  step: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '47%',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  cardDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardActive: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  cardLabelActive: {
    color: colors.onTertiary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  counter: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 11,
    paddingHorizontal: 26,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
