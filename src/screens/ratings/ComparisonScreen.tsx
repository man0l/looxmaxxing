import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { TRAITS } from '../../types/traits';
import type { Scan } from '../../types/scan';
import { topPercentLabel, scoreLabel, deltaLabel } from '../../services/scoring';
import { RingGauge } from '../../components/RingGauge';
import { colors, spacing, radii, typography } from '../../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function overallPercentile(scan: Scan): number {
  return Math.round(scan.scores.reduce((sum, s) => sum + s.percentile, 0) / scan.scores.length);
}

interface Props {
  before: Scan;
  after: Scan;
  onClose: () => void;
}

export function ComparisonScreen({ before, after, onClose }: Props) {
  const beforeOverall = overallPercentile(before);
  const afterOverall = overallPercentile(after);

  return (
    <View style={styles.root}>
      <View style={styles.headerBar}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.back}>‹ Ratings</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.kicker}>Before &amp; after</Text>
        <Text style={styles.title}>
          {formatDate(before.date)} → {formatDate(after.date)}
        </Text>

        <View style={styles.overallCard}>
          <View style={styles.overallSide}>
            <RingGauge percentile={beforeOverall} size={64} centerLabel={scoreLabel(beforeOverall)} />
            <Text style={styles.overallLabel}>{topPercentLabel(beforeOverall)}</Text>
            <Text style={styles.overallDate}>{formatDate(before.date)}</Text>
          </View>
          <View style={styles.overallDelta}>
            <Text style={styles.overallDeltaText}>{deltaLabel(beforeOverall, afterOverall)}</Text>
          </View>
          <View style={styles.overallSide}>
            <RingGauge percentile={afterOverall} size={64} centerLabel={scoreLabel(afterOverall)} />
            <Text style={styles.overallLabel}>{topPercentLabel(afterOverall)}</Text>
            <Text style={styles.overallDate}>{formatDate(after.date)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>By trait</Text>
        <View style={styles.list}>
          {TRAITS.map((t) => {
            const b = before.scores.find((s) => s.traitId === t.id)?.percentile ?? 0;
            const a = after.scores.find((s) => s.traitId === t.id)?.percentile ?? 0;
            const improved = a > b;
            return (
              <View key={t.id} style={styles.row}>
                <Text style={styles.rowLabel}>{t.label}</Text>
                <View style={styles.rowScores}>
                  <Text style={styles.rowScore}>{scoreLabel(b)}</Text>
                  <Text style={styles.rowArrow}>→</Text>
                  <Text style={styles.rowScore}>{scoreLabel(a)}</Text>
                </View>
                <Text style={[styles.rowDelta, improved && styles.rowDeltaUp]}>
                  {deltaLabel(b, a)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerBar: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  back: { ...typography.label, color: colors.primary },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  kicker: { ...typography.caption, color: colors.secondary },
  title: { ...typography.display, fontSize: 24, color: colors.textPrimary, marginTop: spacing.xs, marginBottom: spacing.lg },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  overallSide: { alignItems: 'center', gap: spacing.xs },
  overallLabel: { ...typography.bodySm, color: colors.textSecondary },
  overallDate: { ...typography.caption, color: colors.textTertiary },
  overallDelta: { alignItems: 'center' },
  overallDeltaText: { ...typography.stat, color: colors.tertiary },
  sectionLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rowLabel: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  rowScores: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowScore: { ...typography.stat, color: colors.textSecondary },
  rowArrow: { ...typography.bodySm, color: colors.textTertiary },
  rowDelta: { ...typography.label, color: colors.textSecondary, width: 56, textAlign: 'right' },
  rowDeltaUp: { color: colors.tertiary },
});
