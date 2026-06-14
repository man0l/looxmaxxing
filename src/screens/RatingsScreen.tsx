import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useScans } from '../store/ScanContext';
import { useRescanFlow } from '../hooks/useRescanFlow';
import { CaptureFab } from '../components/CaptureFab';
import { GuidedCaptureScreen } from './onboarding/GuidedCaptureScreen';
import { RingGauge } from '../components/RingGauge';
import { ShareSheet } from '../components/share/ShareSheet';
import { ScoreShareCard } from '../components/share/ShareCards';
import { TRAITS, type TraitScore } from '../types/traits';
import { topPercentLabel, scoreLabel } from '../services/scoring';
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
  const { canRescan, rescanStep, startRescan, onCapture } = useRescanFlow();
  const [shareScan, setShareScan] = useState<Scan | null>(null);

  if (rescanStep) {
    return (
      <GuidedCaptureScreen
        step={rescanStep}
        stepLabel="New scan"
        lightingOk
        onCapture={onCapture}
        onPickFromGallery={() => {}}
        onRetake={() => {}}
        onFlip={() => {}}
      />
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Ratings</Text>
        <Text style={styles.sub}>Every scan you’ve taken.</Text>

        <View style={styles.list}>
          {scans.map((scan, i) => {
            const overall = overallPercentile(scan.scores);
            return (
              <View key={scan.id} style={styles.row}>
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
                  <Text style={styles.overall}>{topPercentLabel(overall)} of men</Text>
                </View>
                <Pressable onPress={() => setShareScan(scan)} hitSlop={8}>
                  <Text style={styles.share}>Share</Text>
                </Pressable>
              </View>
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
  header: { ...typography.display, fontSize: 24, color: colors.textPrimary },
  sub: { ...typography.bodySm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
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
  info: { flex: 1, gap: 3 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { ...typography.h3, color: colors.textPrimary },
  latestBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  latestText: { ...typography.caption, color: colors.tertiary },
  overall: { ...typography.bodySm, color: colors.textSecondary },
  share: { ...typography.label, color: colors.primary },
});
