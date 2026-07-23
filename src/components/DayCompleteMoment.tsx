import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useStreak } from '../store/StreakContext';
import { useScans } from '../store/ScanContext';
import { useOnboarding } from '../store/OnboardingContext';
import { ShareSheet } from './share/ShareSheet';
import { ScoreShareCard } from './share/ShareCards';
import { PressableScale } from './PressableScale';
import { orderForShare, deltaLabel } from '../services/scoring';
import { TRAITS } from '../types/traits';
import { colors, fonts, spacing, radii, typography } from '../theme';

interface Props {
  onClose: () => void;
}

export function DayCompleteMoment({ onClose }: Props) {
  const streak = useStreak();
  const { scans, latest } = useScans();
  const { frontPhoto } = useOnboarding();
  const [showShare, setShowShare] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const prevScan = scans[1];
  const shareRows = orderForShare(latest.scores).map((s) => {
    const before = prevScan?.scores.find((p) => p.traitId === s.traitId)?.percentile;
    return {
      label: TRAITS.find((t) => t.id === s.traitId)?.label ?? s.traitId,
      percentile: s.percentile,
      delta: before != null ? deltaLabel(before, s.percentile) : undefined,
    };
  });
  const overallPct = Math.round(
    latest.scores.reduce((sum, s) => sum + s.percentile, 0) / latest.scores.length,
  );
  const overallDelta = prevScan
    ? deltaLabel(
        prevScan.scores.reduce((sum, s) => sum + s.percentile, 0) / prevScan.scores.length,
        overallPct,
      )
    : undefined;

  const glow = useMemo(() => new Animated.Value(0), []);
  const dayScale = useMemo(() => new Animated.Value(0.92), []);
  const contentOpacity = useMemo(() => new Animated.Value(0), []);
  const contentY = useMemo(() => new Animated.Value(14), []);

  const milestone =
    streak.next != null
      ? `${streak.next - streak.currentDay} days to your ${streak.next}-day milestone`
      : 'Every milestone cleared';

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      glow.setValue(1);
      dayScale.setValue(1);
      contentOpacity.setValue(1);
      contentY.setValue(0);
      return;
    }
    glow.setValue(0);
    dayScale.setValue(0.92);
    contentOpacity.setValue(0);
    contentY.setValue(14);

    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(glow, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(dayScale, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 340,
          useNativeDriver: true,
        }),
      ]),
    ]);
    entrance.start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.55,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulseTimer = setTimeout(() => pulse.start(), 700);
    return () => {
      entrance.stop();
      pulse.stop();
      clearTimeout(pulseTimer);
    };
  }, [contentOpacity, contentY, dayScale, glow, reduceMotion]);

  return (
    <>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.radialGlow,
            {
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
              transform: [
                {
                  scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
                },
              ],
            },
          ]}
        />
        <View style={styles.sheet}>
          <Text style={styles.kicker}>All done for today</Text>
          <View style={styles.dayWrap}>
            <Animated.Text
              style={[styles.day, { transform: [{ scale: dayScale }] }]}
              allowFontScaling={false}
            >
              Day {streak.currentDay}
            </Animated.Text>
          </View>
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={styles.sub}>Your streak is still growing.</Text>
            <Text style={styles.milestone}>{milestone}</Text>

            <PressableScale style={styles.shareBtn} onPress={() => setShowShare(true)}>
              <Text style={styles.shareText}>Share results</Text>
            </PressableScale>
            <Pressable style={styles.continueBtn} onPress={onClose}>
              <Text style={styles.continueText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {showShare && (
        <ShareSheet message="My axend scan" onClose={() => setShowShare(false)}>
          <ScoreShareCard
            overallPercentile={overallPct}
            overallDelta={overallDelta}
            rows={shareRows}
            photoUri={latest.photoUri ?? frontPhoto ?? undefined}
          />
        </ShareSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 6, 4, 0.78)',
  },
  radialGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.tertiary,
  },
  sheet: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    overflow: 'visible',
  },
  kicker: {
    ...typography.caption,
    color: colors.tertiary,
    marginBottom: spacing.sm,
  },
  dayWrap: {
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'visible',
  },
  day: {
    fontFamily: fonts.semiBold,
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '600',
    letterSpacing: -1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sub: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  milestone: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  shareBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  continueBtn: {
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  continueText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
