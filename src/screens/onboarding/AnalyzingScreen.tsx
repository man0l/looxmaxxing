import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import { ScanMotif } from '../../components/ScanMotif';

const STEPS = [
  'Detecting facial features',
  'Measuring proportions',
  'Analyzing skin quality',
  'Checking symmetry',
  'Calculating scores',
  'Finalizing results',
];

const STEP_DURATION = 950;
const FINAL_PAUSE = 1000;

interface Props {
  onComplete: () => void;
}

export function AnalyzingScreen({ onComplete }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) {
      const t = setTimeout(onComplete, FINAL_PAUSE);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), STEP_DURATION);
    return () => clearTimeout(t);
  }, [activeIndex, onComplete]);

  return (
    <View style={styles.container}>
      <OnboardingProgressBar current={10} />
      <View style={styles.well}>
        <ScanMotif size={148} />
      </View>
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
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    gap: spacing.xxl,
  },
  well: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
