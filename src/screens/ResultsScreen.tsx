import { useCallback, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../store/OnboardingContext';
import { useSubscription } from '../store/SubscriptionContext';
import { BlurredTraitGrid } from '../components/BlurredTraitGrid';
import { TraitGrid } from '../components/TraitGrid';
import { CaptureFab } from '../components/CaptureFab';
import { ScreenShell } from '../components/ScreenShell';
import { BannerPremium } from '../components/BannerPremium';
import { BrandMark } from '../components/BrandMark';
import { Card } from '../components/Card';
import { PressableScale } from '../components/PressableScale';
import { RingGauge } from '../components/RingGauge';
import { ScanMotif } from '../components/ScanMotif';
import { TabSwipeHost } from '../components/TabSwipeHost';
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
import { useTabRootReset } from '../hooks/useTabRootReset';
import {
  orderForShare,
  scoreLabel,
  deltaLabel,
  topPercentLabel,
} from '../services/scoring';
import { TRAITS } from '../types/traits';
import { colors, spacing, radii, typography } from '../theme';

export function ResultsScreen() {
  const { concerns, frontPhoto } = useOnboarding();
  const { subscribed, ready: entitlementReady, openPaywall } = useSubscription();
  const streak = useStreak();
  const navigation = useNavigation();
  const [showStreak, setShowStreak] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [openTrait, setOpenTrait] = useState<string | null>(null);
  const { scans, latest, hasRealScan, scanError, runScan } = useScans();
  const { canRescan, rescanStep, startRescan, cancelRescan, onCapture, justRescanned, scanning } =
    useRescanFlow();
  const { onCaptureFabPress } = useCaptureFabPress(startRescan);
  const goToPractice = () => navigation.navigate('Practice' as never);

  const popNested = useCallback(() => {
    setShowStreak(false);
    setOpenTrait(null);
    setShowShare(false);
    cancelRescan();
  }, [cancelRescan]);

  useTabRootReset(popNested);

  const isNested = Boolean(showStreak || openTrait || rescanStep || showShare);

  let body: ReactNode;

  if (!entitlementReady) {
    body = (
      <ScreenShell style={styles.analyzingRoot}>
        <View />
      </ScreenShell>
    );
  } else if (!subscribed) {
    body = (
      <ScreenShell>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.lockedContainer}>
          <BrandMark style={styles.brandLocked} />
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
  } else if (!hasRealScan) {
    // First real scan runs right after payment (App.tsx). Show analyzing /
    // retry until scores land — never leave the user stuck on seeded mocks.
    body = (
      <ScreenShell style={styles.analyzingRoot}>
        {scanning ? (
          <>
            <ScanMotif size={132} />
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
                if (frontPhoto) {
                  runScan({ frontUri: frontPhoto }).catch(() => {});
                }
              }}
            >
              <Text style={styles.retryText}>Try again</Text>
            </PressableScale>
          </>
        )}
      </ScreenShell>
    );
  } else if (showStreak) {
    body = <StreakScreen onClose={() => setShowStreak(false)} />;
  } else if (openTrait) {
    body = (
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
  } else if (rescanStep) {
    body = (
      <GuidedCaptureScreen
        stepLabel="New scan"
        onCapture={onCapture}
        onCancel={cancelRescan}
      />
    );
  } else {
    const allDone = streak.tasksLeftToday === 0 && streak.tasksTotalToday > 0;
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
    const overallScore = scoreLabel(overallPct);
    const overallDelta = prevScan
      ? deltaLabel(
          prevScan.scores.reduce((sum, s) => sum + s.percentile, 0) / prevScan.scores.length,
          overallPct,
        )
      : undefined;
    const photoUri = latest.photoUri ?? frontPhoto ?? undefined;
    const improved = overallDelta != null && overallDelta.startsWith('+');
    const declined = overallDelta != null && overallDelta.startsWith('-');

    body = (
      <ScreenShell>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.unlockedContainer}>
          <BrandMark />
          <View style={styles.topBar}>
            <Pressable
              style={styles.streakChip}
              onPress={() => setShowStreak(true)}
              accessibilityRole="button"
              accessibilityLabel={`Day ${streak.currentDay} streak`}
            >
              <Text style={styles.streakDay}>Day {streak.currentDay}</Text>
              <Text style={styles.streakDot}>·</Text>
              <Text style={styles.streakTasks}>
                {allDone ? 'all done ✓' : `${streak.tasksLeftToday} left today`}
              </Text>
              <Text style={styles.streakChevron}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowShare(true)}
              hitSlop={8}
              accessibilityLabel="Share results"
            >
              <ShareIcon size={22} color={colors.primary} />
            </Pressable>
          </View>

          {justRescanned && (
            <Card role="inset" style={styles.doneBanner}>
              <Text style={styles.doneText}>✓ New scan saved — your percentiles updated</Text>
            </Card>
          )}

          <Text style={styles.sectionFocus}>Overall</Text>
          <Card
            role="hero"
            style={styles.overallHero}
            onPress={() => setShowShare(true)}
            accessibilityLabel="Share overall results"
          >
            <View style={styles.overallVisual}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.heroPhoto} />
              ) : (
                <View style={[styles.heroPhoto, styles.heroPhotoEmpty]} />
              )}
              <View style={styles.ringBadge}>
                <RingGauge
                  percentile={overallPct}
                  size={92}
                  centerLabel={overallScore}
                  delayMs={0}
                />
              </View>
            </View>
            <Text style={styles.overallPercentile}>
              {topPercentLabel(overallPct)} of men
            </Text>
            {overallDelta != null && (
              <View
                style={[
                  styles.deltaChip,
                  improved && styles.deltaChipUp,
                  declined && styles.deltaChipDown,
                ]}
              >
                <Text
                  style={[
                    styles.deltaText,
                    improved && styles.deltaTextUp,
                    declined && styles.deltaTextDown,
                  ]}
                >
                  {overallDelta}
                </Text>
              </View>
            )}
          </Card>

          <Text style={styles.sectionFocus}>Your focus</Text>
          <TraitGrid
            concerns={concerns}
            scores={latest.scores}
            onOpenPlan={setOpenTrait}
            revealBaseMs={160}
          />

          <Card
            role="quiet"
            onPress={() => navigation.navigate('Avatars' as never)}
            style={styles.potentialCard}
          >
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
              overallPercentile={overallPct}
              overallDelta={overallDelta}
              rows={shareRows}
              photoUri={latest.photoUri ?? frontPhoto ?? undefined}
            />
          </ShareSheet>
        )}

        {scanning && (
          <View style={styles.analyzingOverlay}>
            <ScanMotif size={120} />
            <Text style={styles.analyzingText}>Analyzing your photos…</Text>
          </View>
        )}
      </ScreenShell>
    );
  }

  return (
    <TabSwipeHost
      isNested={isNested}
      onPopNested={popNested}
      enabled={entitlementReady && !(subscribed && !hasRealScan && scanning)}
    >
      {body}
    </TabSwipeHost>
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
    paddingTop: 56,
    paddingBottom: 110,
  },
  header: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
  },
  brandLocked: {
    marginBottom: spacing.lg,
  },
  unlockedContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: 110,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexShrink: 1,
  },
  streakDay: {
    ...typography.stat,
    fontSize: 14,
    color: colors.tertiary,
  },
  streakDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  streakTasks: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  streakChevron: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 2,
  },
  overallHero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  overallVisual: {
    position: 'relative',
    width: 168,
    height: 168,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  heroPhoto: {
    width: 168,
    height: 168,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInset,
  },
  heroPhotoEmpty: {
    borderStyle: 'dashed',
  },
  ringBadge: {
    position: 'absolute',
    right: -14,
    bottom: -14,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 4,
    borderColor: colors.surface,
    padding: 3,
  },
  overallPercentile: {
    ...typography.display,
    fontSize: 26,
    lineHeight: 30,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  deltaChip: {
    alignSelf: 'center',
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.surfaceInset,
  },
  deltaChipUp: {
    backgroundColor: 'rgba(239,230,216,0.14)',
  },
  deltaChipDown: {
    backgroundColor: 'rgba(154,146,133,0.14)',
  },
  deltaText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  deltaTextUp: {
    color: colors.tertiary,
  },
  deltaTextDown: {
    color: colors.textSecondary,
  },
  sectionFocus: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: -spacing.sm,
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
