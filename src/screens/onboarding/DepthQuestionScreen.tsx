import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { DepthAnswer } from '../../types/onboarding';
import { colors, spacing, radii, typography } from '../../theme';
import { ConcernGlyph } from '../../components/icons/OnboardingIcons';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';

const ANSWERS: { value: DepthAnswer; label: string }[] = [
  { value: 'recently', label: 'Just recently' },
  { value: 'a_while', label: 'A while' },
  { value: 'years', label: 'Years' },
];

const CONCERN_LABELS: Record<string, string> = {
  jawline: 'Sharper jawline',
  cheekbones: 'Defined cheekbones',
  skin: 'Better skin',
  hair: 'Fuller-looking hair',
  masculinity: 'Masculine presence',
  smile: 'Attractive smile',
  eyes: 'Eye area',
};

interface Props {
  concernId: string;
  selected: DepthAnswer | null;
  onSelect: (answer: DepthAnswer) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function DepthQuestionScreen({
  concernId,
  selected,
  onSelect,
  onContinue,
  onSkip,
}: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <OnboardingProgressBar current={3} />
      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <ConcernGlyph id={concernId} size={13} color={colors.onTertiary} />
          <Text style={styles.tagText}>{CONCERN_LABELS[concernId] || concernId}</Text>
        </View>
      </View>
      <Text style={styles.title}>How long have you been thinking about this?</Text>

      <View style={styles.options}>
        {ANSWERS.map((answer) => {
          const isActive = selected === answer.value;
          return (
            <Pressable
              key={answer.value}
              onPress={() => onSelect(answer.value)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillDefault]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {answer.label}
              </Text>
              {isActive && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <Pressable
        onPress={onContinue}
        style={[styles.cta, !selected && styles.ctaDisabled]}
        disabled={!selected}
      >
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
      <Pressable onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
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
  tagRow: {
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    paddingVertical: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    lineHeight: 28,
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
  spacer: {
    flex: 1,
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
  skipBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  skipText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
