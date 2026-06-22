import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useScans } from '../store/ScanContext';
import { useOnboarding } from '../store/OnboardingContext';
import { useRescanFlow } from '../hooks/useRescanFlow';
import { CaptureFab } from '../components/CaptureFab';
import { GuidedCaptureScreen } from './onboarding/GuidedCaptureScreen';
import { RingGauge } from '../components/RingGauge';
import { ShareSheet } from '../components/share/ShareSheet';
import { ScoreShareCard } from '../components/share/ShareCards';
import { ComparisonScreen } from './ratings/ComparisonScreen';
import { ShareIcon, CompareIcon } from '../components/icons/ActionIcons';
import { TRAITS, type TraitScore } from '../types/traits';
import { topPercentLabel, scoreLabel, deltaLabel } from '../services/scoring';
import type { Scan } from '../types/scan';
import { colors, spacing, radii, typography } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function overallPercentile(scores: TraitScore[]): number {
  return Math.round(scores.reduce((sum, s) => sum + s.percentile, 0) / scores.length);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function shareRows(scores: TraitScore[]) {
  return scores.map((s) => ({
    label: TRAITS.find((t) => t.id === s.traitId)?.label ?? s.traitId,
    percentile: s.percentile,
  }));
}

export function RatingsScreen() {
  const { scans } = useScans();
  const { frontPhoto } = useOnboarding();
  const { canRescan, rescanStep, startRescan, onCapture } = useRescanFlow();
  const [shareScan, setShareScan] = useState<Scan | null>(null);
  const [comparePair, setComparePair] = useState<[Scan, Scan] | null>(null);

  const openCompare = (older: Scan, newer: Scan) => setComparePair([older, newer]);

  if (comparePair) {
    return (
      <ComparisonScreen
        before={comparePair[0]}
        after={comparePair[1]}
        onClose={() => setComparePair(null)}
      />
    );
  }

  if (rescanStep) {
    return <GuidedCaptureScreen step={rescanStep} stepLabel="New scan" onCapture={onCapture} />;
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.header}>Ratings</Text>
            <Text style={styles.sub}>Every scan you’ve taken.</Text>
          </View>
          {scans.length >= 2 && (
            <Pressable
              style={styles.compareBtn}
              onPress={() => openCompare(scans[1], scans[0])}
              hitSlop={8}
            >
              <CompareIcon size={18} color={colors.primary} />
              <Text style={styles.compareLabel}>Compare</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.list}>
          {scans.map((scan, i) => {
            const overall = overallPercentile(scan.scores);
            const prev = scans[i + 1];
            const delta = prev ? deltaLabel(overallPercentile(prev.scores), overall) : null;
            const improved = delta != null && delta.startsWith('+');
            const declined = delta != null && delta.startsWith('-');
            const canTap = Boolean(prev);
            return (
              <Pressable
                key={scan.id}
                style={({ pressed }) => [styles.row, pressed && canTap && styles.rowPressed]}
                onPress={canTap ? () => openCompare(prev, scan) : undefined}
              >
                <RingGauge percentile={overall} size={48} centerLabel={scoreLabel(overall)} />
                <View style={styles.info}>
                  <View style={styles.dateRow}>
                    <Text style={styles.date}>{formatDate(scan.date)}</Text>
                    {i === 0 && (
                      <View style={styles.latestBadge}>
                        <Text style={styles.latestText}>Latest</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.overallRow}>
                    <Text style={styles.overall}>{topPercentLabel(overall)} of men</Text>
                    {delta ? (
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
                          {improved ? '▲ ' : declined ? '▼ ' : ''}
                          {delta}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.firstScan}>First scan</Text>
                    )}
                  </View>
                </View>
                <Pressable
                  style={styles.shareBtn}
                  onPress={() => setShareScan(scan)}
                  hitSlop={8}
                >
                  <ShareIcon size={20} color={colors.primary} />
                </Pressable>
                {canTap && <Text style={styles.chevron}>›</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <CaptureFab onPress={canRescan ? startRescan : () => {}} />

      {shareScan && (
        <ShareSheet message="My looxmaxxing scan" onClose={() => setShareScan(null)}>
          <ScoreShareCard
            overall={scoreLabel(overallPercentile(shareScan.scores))}
            rows={shareRows(shareScan.scores)}
            photoUri={shareScan.photoUri ?? frontPhoto ?? undefined}
          />
        </ShareSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: 110 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  header: { ...typography.display, fontSize: 24, color: colors.textPrimary },
  sub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  compareLabel: { ...typography.label, color: colors.primary },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  rowPressed: { borderColor: colors.primary, backgroundColor: colors.surfaceRaised },
  info: { flex: 1, gap: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { ...typography.h3, color: colors.textPrimary },
  latestBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  latestText: { ...typography.caption, color: colors.tertiary },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  overall: { ...typography.bodySm, color: colors.textSecondary },
  deltaChip: {
    borderRadius: radii.sm,
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: colors.surfaceInset,
  },
  deltaChipUp: { backgroundColor: 'rgba(239,230,216,0.12)' },
  deltaChipDown: { backgroundColor: 'rgba(154,146,133,0.12)' },
  deltaText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  deltaTextUp: { color: colors.tertiary },
  deltaTextDown: { color: colors.textSecondary },
  firstScan: { ...typography.caption, color: colors.textTertiary },
  shareBtn: { padding: 2 },
  chevron: { fontSize: 20, color: colors.textTertiary },
});
