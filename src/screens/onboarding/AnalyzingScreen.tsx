import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const STEPS = [
  'Detecting facial features',
  'Measuring proportions',
  'Analyzing skin quality',
  'Checking symmetry',
  'Calculating scores',
  'Finalizing results',
];

interface Props {
  onComplete: () => void;
}

export function AnalyzingScreen({ onComplete }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [activeIndex, onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🙂</Text>
      <Text style={styles.title}>Analyzing Your Face</Text>

      <View style={styles.steps}>
        {STEPS.map((label, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <View key={label} style={styles.stepRow}>
              <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                {done && <Text style={styles.dotCheck}>✓</Text>}
              </View>
              <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    backgroundColor: colors.surface,
    borderRadius: 999,
    overflow: 'hidden',
    width: 88,
    height: 88,
    textAlign: 'center',
    lineHeight: 88,
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  steps: {
    width: '100%',
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: colors.primary,
  },
  dotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotCheck: {
    fontSize: 12,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.textPrimary,
  },
});
