import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useOnboarding } from '../../store/OnboardingContext';
import { HeadSilhouette } from '../../components/icons/OnboardingIcons';

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
const WELL_SIZE = 120;
const SCAN_TRAVEL = WELL_SIZE - 16;

interface Props {
  onComplete: () => void;
}

export function AnalyzingScreen({ onComplete }: Props) {
  const { frontPhoto } = useOnboarding();
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) {
      const t = setTimeout(onComplete, FINAL_PAUSE);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), STEP_DURATION);
    return () => clearTimeout(t);
  }, [activeIndex, onComplete]);

  useEffect(() => {
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(scanY, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ]),
    );
    sweep.start();
    return () => sweep.stop();
  }, [scanY]);

  const translateY = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCAN_TRAVEL / 2, SCAN_TRAVEL / 2],
  });

  return (
    <View style={styles.container}>
      <View style={styles.well}>
        {frontPhoto ? (
          <Image source={{ uri: frontPhoto }} style={styles.photo} />
        ) : (
          <HeadSilhouette size={56} color={colors.textTertiary} />
        )}
        <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  well: {
    width: WELL_SIZE,
    height: WELL_SIZE,
    borderRadius: WELL_SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    width: '72%',
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
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
