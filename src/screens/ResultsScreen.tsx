import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../store/OnboardingContext';
import { useSubscription } from '../store/SubscriptionContext';
import { BlurredTraitGrid } from '../components/BlurredTraitGrid';
import { TraitGrid } from '../components/TraitGrid';
import { CaptureFab } from '../components/CaptureFab';
import { ScreenShell } from '../components/ScreenShell';
import { BannerPremium } from '../components/BannerPremium';
import { Card } from '../components/Card';
import { PressableScale } from '../components/PressableScale';
import { StreakScreen } from './StreakScreen';
import { TraitDetailScreen } from './TraitDetailScreen';
import { GuidedCaptureScreen } from './onboarding/GuidedCaptureScreen';
import { ShareSheet } from '../components/share/ShareSheet';
import { ScoreShareCard } from '../components/share/ShareCards';
import { ShareIcon } from '../components/icons/ActionIcons';
import { useStreak } from '../store/StreakContext';
import { useScans } from '../store/ScanContext';
import { useRescanFlow } from '../hooks/useRescanFlow';
import { useCaptureFabPress } from '../hooks/useCaptureFabPress';
import { orderByConcerns, scoreLabel, deltaLabel } from '../services/scoring';
import { TRAITS } from '../types/traits';
import { colors, spacing, radii, typography } from '../theme';

export function ResultsScreen() {
  const { concerns, frontPhoto, profilePhoto } = useOnboarding();
  const { subscribed, openPaywall } = useSubscription();
  const streak = useStreak();
  const navigation = useNavigation();
  const [showStreak, setShowStreak] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [openTrait, setOpenTrait] = useState<string | null>(null);
  const { scans, latest, hasRealScan, scanError, runScan } = useScans();
  const { canRescan, rescanStep, startRescan, onCapture, justRescanned, scanning } = useRescanFlow();
  const { onCaptureFabPress } = useCaptureFabPress(startRescan);
  const goToPractice = () => navigation.navigate('Practice' as never);

  if (!subscribed) {
    return (
      <ScreenShell>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.lockedContainer}>
          <Text style={styles.header}>Results</Text>
          <BlurredTraitGrid concerns={concerns} />
          <BannerPremium
            onPress={openPaywall}
            style={styles.unlockBanner}
            accessibilityLabel="Unlock your results"
          >
            <Text style={styles.unlockTitle}>Your scores are waiting</Text>
            <Text style={styles.unlockCaption}>
              Unlock to see your full analysis and the plan for every trait.
            </Text>
          </BannerPremium>
        </ScrollView>
        <CaptureFab onPress={openPaywall} />
      </ScreenShell>
    );
  }

  // The first real scan runs right after payment (triggered in App.tsx). Until
  // it lands, show an analyzing state instead of the mock-seeded results; on
  // failure, offer a retry so the user is never stuck.
  if (subscribed && !hasRealScan) {
    return (
      <ScreenShell style={styles.analyzingRoot}>
        {scanning ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.analyzingTitle}>Analyzing your photos</Text>
            <Text style={styles.analyzingSub}>Scoring your traits with AI…</Text>
          </>
        ) : (
          <>
            <Text style={styles.analyzingTitle}>Couldn’t finish your scan</Text>
            <Text style={styles.analyzingSub}>{scanError ?? 'Something went wrong.'}</Text>
            <PressableScale
              style={styles.retryBtn}
              onPress={() => {
                if (frontPhoto && profilePhoto) {
                  runScan({ frontUri: frontPhoto, profileUri: profilePhoto }).catch(() => {});
                }
              }}
            >
              <Text style={styles.retryText}>Try again</Text>
            </PressableScale>
          </>
        )}
      </ScreenShell>
    );
  }

  if (showStreak) {
    return <StreakScreen onClose={() => setShowStreak(false)} />;
  }

  if (openTrait) {
    return (
      <TraitDetailScreen
        traitId={openTrait}
        onClose={() => setOpenTrait(null)}
        onOpenPlan={() => {
          setOpenTrait(null);
          goToPractice();
        }}
        onPreview={() => {
          const traitId = openTrait;
          setOpenTrait(null);
          (navigation as unknown as {
            navigate: (name: string, params?: object) => void;
          }).navigate('Avatars', { focusTrait: traitId });
        }}
      />
    );
  }

  if (rescanStep) {
    return (
      <GuidedCaptureScreen
        step={rescanStep}
        stepLabel="New scan"
        onCapture={onCapture}
      />
    );
  }

  const allDone = streak.tasksLeftToday === 0 && streak.tasksTotalToday > 0;

  const prevScan = scans[1];
  const orderedScores = orderByConcerns(latest.scores, concerns);
  const shareRows = orderedScores.map((s) => {
    const before = prevScan?.scores.find((p) => p.traitId === s.traitId)?.percentile;
    return {
      label: TRAITS.find((t) => t.id === s.traitId)?.label ?? s.traitId,
      percentile: s.percentile,
      delta: before != null ? deltaLabel(before, s.percentile) : undefined,
    };
  });
  const overallPct = orderedScores.reduce((sum, s) => sum + s.percentile, 0) / orderedScores.length;
  const overallScore = scoreLabel(overallPct);
  const overallDelta = prevScan
    ? deltaLabel(
        prevScan.scores.reduce((sum, s) => sum + s.percentile, 0) / prevScan.scores.length,
        overallPct,
      )
    : undefined;

  return (
    <ScreenShell>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.unlockedContainer}>
        <Card role="hero" onPress={() => setShowStreak(true)} style={styles.streakBanner}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakDay}>Day {streak.currentDay}</Text>
            <Text style={styles.streakTasks}>
              {allDone
                ? 'all done today ✓'
                : `${streak.tasksLeftToday} ${streak.tasksLeftToday === 1 ? 'task' : 'tasks'} left today`}
            </Text>
          </View>
          <Text style={styles.streakChevron}>›</Text>
        </Card>

        {justRescanned && (
          <Card role="inset" style={styles.doneBanner}>
            <Text style={styles.doneText}>✓ New scan saved — your percentiles updated</Text>
          </Card>
        )}

        <View style={styles.headerRow}>
          <Text style={styles.header}>Your results</Text>
          <Pressable onPress={() => setShowShare(true)} hitSlop={8}>
            <ShareIcon size={22} color={colors.primary} />
          </Pressable>
        </View>

        <TraitGrid concerns={concerns} scores={latest.scores} onOpenPlan={setOpenTrait} />

        <Card role="quiet" onPress={() => navigation.navigate('Avatars' as never)} style={styles.potentialCard}>
          <View style={styles.potentialInfo}>
            <Text style={styles.potentialTitle}>See your potential</Text>
            <Text style={styles.potentialCaption}>
              Preview where your plan can take each trait.
            </Text>
          </View>
          <Text style={styles.potentialChevron}>›</Text>
        </Card>

        {hasRealScan && (
          <Card role="inset" onPress={startRescan} style={styles.rescanCardActive}>
            <Text style={styles.rescanTitleActive}>Re-rate now ›</Text>
            <Text style={styles.rescanCaption}>
              Capture a new scan anytime to see how your percentiles moved.
            </Text>
          </Card>
        )}
      </ScrollView>
      <CaptureFab onPress={onCaptureFabPress} disabled={!canRescan} />

      {showShare && (
        <ShareSheet message="My axend scan" onClose={() => setShowShare(false)}>
          <ScoreShareCard
            overall={overallScore}
            overallDelta={overallDelta}
            rows={shareRows}
            photoUri={latest.photoUri ?? frontPhoto ?? undefined}
          />
        </ShareSheet>
      )}

      {scanning && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.analyzingText}>Analyzing your photos…</Text>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  lockedContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 110,
  },
  unlockedContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 110,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  header: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  streakDay: {
    ...typography.stat,
    color: colors.tertiary,
  },
  streakTasks: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  streakChevron: {
    fontSize: 20,
    color: colors.primary,
  },
  potentialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  potentialInfo: { flex: 1, gap: 3 },
  potentialTitle: { ...typography.h3, color: colors.textPrimary },
  potentialCaption: { ...typography.bodySm, color: colors.textSecondary },
  potentialChevron: { fontSize: 20, color: colors.textTertiary },
  unlockBanner: {
    marginTop: spacing.lg,
  },
  unlockTitle: {
    ...typography.h2,
    color: colors.onSecondary,
  },
  unlockCaption: {
    ...typography.bodySm,
    color: colors.onSecondary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  rescanCardActive: {
    borderColor: colors.primary,
  },
  rescanTitleActive: {
    ...typography.h3,
    color: colors.primary,
  },
  doneBanner: {
    borderColor: colors.tertiary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  doneText: {
    ...typography.bodySm,
    color: colors.tertiary,
  },
  rescanCaption: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,6,4,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  analyzingRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  analyzingTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  analyzingSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
