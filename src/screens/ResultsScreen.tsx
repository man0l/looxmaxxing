import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../store/OnboardingContext';
import { useSubscription } from '../store/SubscriptionContext';
import { BlurredTraitGrid } from '../components/BlurredTraitGrid';
import { TraitGrid } from '../components/TraitGrid';
import { CaptureFab } from '../components/CaptureFab';
import { StreakScreen } from './StreakScreen';
import { GuidedCaptureScreen } from './onboarding/GuidedCaptureScreen';
import { ShareSheet } from '../components/share/ShareSheet';
import { ScoreShareCard } from '../components/share/ShareCards';
import { useStreak } from '../store/StreakContext';
import { useScans } from '../store/ScanContext';
import { useRescanFlow } from '../hooks/useRescanFlow';
import { orderByConcerns, scoreLabel } from '../services/scoring';
import { TRAITS } from '../types/traits';
import { colors, spacing, radii, typography } from '../theme';

export function ResultsScreen() {
  const { concerns } = useOnboarding();
  const { subscribed, openPaywall } = useSubscription();
  const streak = useStreak();
  const navigation = useNavigation();
  const [showStreak, setShowStreak] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { latest, daysUntilRescan } = useScans();
  const { canRescan, rescanStep, startRescan, onCapture, justRescanned } = useRescanFlow();
  const goToPractice = () => navigation.navigate('Practice' as never);

  if (!subscribed) {
    return (
      <View style={styles.root}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.lockedContainer}>
          <Text style={styles.header}>Results</Text>
          <BlurredTraitGrid concerns={concerns} />
          <Pressable onPress={openPaywall} style={styles.unlockBanner}>
            <Text style={styles.unlockTitle}>Your scores are waiting</Text>
            <Text style={styles.unlockCaption}>
              Unlock to see your full analysis and the plan for every trait.
            </Text>
          </Pressable>
        </ScrollView>
        <CaptureFab onPress={openPaywall} />
      </View>
    );
  }

  if (showStreak) {
    return <StreakScreen onClose={() => setShowStreak(false)} />;
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

  const orderedScores = orderByConcerns(latest.scores, concerns);
  const shareRows = orderedScores.map((s) => ({
    label: TRAITS.find((t) => t.id === s.traitId)?.label ?? s.traitId,
    percentile: s.percentile,
  }));
  const overallScore = scoreLabel(
    orderedScores.reduce((sum, s) => sum + s.percentile, 0) / orderedScores.length,
  );

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.unlockedContainer}>
        <Pressable style={styles.streakBanner} onPress={() => setShowStreak(true)}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakDay}>Day {streak.currentDay}</Text>
            <Text style={styles.streakTasks}>
              {allDone
                ? 'all done today ✓'
                : `${streak.tasksLeftToday} ${streak.tasksLeftToday === 1 ? 'task' : 'tasks'} left today`}
            </Text>
          </View>
          <Text style={styles.streakChevron}>›</Text>
        </Pressable>

        {justRescanned && (
          <View style={styles.doneBanner}>
            <Text style={styles.doneText}>✓ New scan saved — your percentiles updated</Text>
          </View>
        )}

        <View style={styles.headerRow}>
          <Text style={styles.header}>Your results</Text>
          <Pressable onPress={() => setShowShare(true)} hitSlop={8}>
            <Text style={styles.shareLink}>Share</Text>
          </Pressable>
        </View>

        <TraitGrid concerns={concerns} scores={latest.scores} onOpenPlan={goToPractice} />

        {canRescan ? (
          <Pressable style={styles.rescanCardActive} onPress={startRescan}>
            <Text style={styles.rescanTitleActive}>Re-rate now ›</Text>
            <Text style={styles.rescanCaption}>
              Your 14-day window is up — capture a new scan to see your progress.
            </Text>
          </Pressable>
        ) : (
          <View style={styles.rescanCard}>
            <Text style={styles.rescanTitle}>Re-rate in {daysUntilRescan} days</Text>
            <Text style={styles.rescanCaption}>
              Work your plan, then re-scan — your percentile can move.
            </Text>
          </View>
        )}
      </ScrollView>
      <CaptureFab onPress={canRescan ? startRescan : () => {}} />

      {showShare && (
        <ShareSheet message="My looxmaxxing scan" onClose={() => setShowShare(false)}>
          <ScoreShareCard overall={overallScore} rows={shareRows} />
        </ShareSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
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
  shareLink: {
    ...typography.label,
    color: colors.primary,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
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
  unlockBanner: {
    backgroundColor: colors.secondary,
    borderRadius: radii.lg,
    padding: spacing.xl,
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
  rescanCard: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  rescanCardActive: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  rescanTitleActive: {
    ...typography.h3,
    color: colors.primary,
  },
  doneBanner: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  doneText: {
    ...typography.bodySm,
    color: colors.tertiary,
  },
  rescanTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  rescanCaption: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
