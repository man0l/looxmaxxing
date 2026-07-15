import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { TRAITS } from '../types/traits';
import { useScans } from '../store/ScanContext';
import { topPercentLabel, scoreLabel } from '../services/scoring';
import { RingGauge } from '../components/RingGauge';
import { ScoreTimeline, type TimelinePoint } from '../components/ScoreTimeline';
import { BackHeader, NestedScreen } from '../components/BackHeader';
import { colors, spacing, radii, typography } from '../theme';

interface Props {
  traitId: string;
  onClose: () => void;
  onOpenPlan: () => void;
  onPreview: () => void;
}

function percentileFor(scores: { traitId: string; percentile: number }[], traitId: string): number {
  return scores.find((s) => s.traitId === traitId)?.percentile ?? 0;
}

export function TraitDetailScreen({ traitId, onClose, onOpenPlan, onPreview }: Props) {
  const { scans } = useScans();
  const trait = TRAITS.find((t) => t.id === traitId);
  const latestPct = percentileFor(scans[0].scores, traitId);

  const points: TimelinePoint[] = [...scans]
    .reverse()
    .map((scan) => ({ date: scan.date, percentile: percentileFor(scan.scores, traitId) }));

  return (
    <NestedScreen onClose={onClose} style={styles.root}>
      <BackHeader onClose={onClose} />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <View style={styles.hero}>
          <RingGauge percentile={latestPct} size={100} centerLabel={scoreLabel(latestPct)} />
          <View style={styles.heroInfo}>
            <Text style={styles.title}>{trait?.label ?? traitId}</Text>
            <Text style={styles.percentile}>{topPercentLabel(latestPct)} of men</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownKey}>Score</Text>
            <Text style={styles.breakdownVal}>{scoreLabel(latestPct)} / 10</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownKey}>Percentile</Text>
            <Text style={styles.breakdownVal}>{topPercentLabel(latestPct)}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownRowLast]}>
            <Text style={styles.breakdownKey}>Scans</Text>
            <Text style={styles.breakdownVal}>{scans.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Score timeline</Text>
        <ScoreTimeline points={points} />

        <Pressable style={styles.cta} onPress={onOpenPlan}>
          <Text style={styles.ctaText}>Open {trait?.plan ?? 'plan'} ›</Text>
        </Pressable>

        <Pressable style={styles.previewLink} onPress={onPreview}>
          <Text style={styles.previewLinkText}>Preview your potential ›</Text>
        </Pressable>
      </ScrollView>
    </NestedScreen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.md },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroInfo: { flex: 1, gap: spacing.xs },
  title: { ...typography.display, fontSize: 26, color: colors.textPrimary },
  percentile: { ...typography.stat, fontSize: 15, color: colors.tertiary },
  sectionLabel: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownRowLast: { borderBottomWidth: 0 },
  breakdownKey: { ...typography.bodySm, color: colors.textSecondary },
  breakdownVal: { ...typography.stat, fontSize: 15, color: colors.textPrimary },
  cta: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaText: { ...typography.h3, color: colors.primary },
  previewLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  previewLinkText: { ...typography.label, color: colors.secondary },
});
