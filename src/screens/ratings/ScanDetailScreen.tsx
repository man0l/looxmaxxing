import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TRAITS } from '../../types/traits';
import type { Scan } from '../../types/scan';
import { topPercentLabel, scoreLabel } from '../../services/scoring';
import { RingGauge } from '../../components/RingGauge';
import { BackHeader, NestedScreen } from '../../components/BackHeader';
import { colors, spacing, radii, typography } from '../../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function overallPercentile(scan: Scan): number {
  return Math.round(scan.scores.reduce((sum, s) => sum + s.percentile, 0) / scan.scores.length);
}

interface Props {
  scan: Scan;
  isFirst?: boolean;
  onClose: () => void;
}

export function ScanDetailScreen({ scan, isFirst, onClose }: Props) {
  const overall = overallPercentile(scan);

  return (
    <NestedScreen onClose={onClose} style={styles.root}>
      <BackHeader onClose={onClose} />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.kicker}>{isFirst ? 'First scan' : 'Scan'}</Text>
        <Text style={styles.title}>{formatDate(scan.date)}</Text>

        <View style={styles.overallCard}>
          <RingGauge percentile={overall} size={72} centerLabel={scoreLabel(overall)} />
          <View style={styles.overallInfo}>
            <Text style={styles.overallTop}>{topPercentLabel(overall)} of men</Text>
            <Text style={styles.overallNote}>
              {isFirst
                ? 'Your starting point — re-scan to track progress.'
                : 'Overall across all traits.'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>By trait</Text>
        <View style={styles.list}>
          {TRAITS.map((t) => {
            const p = scan.scores.find((s) => s.traitId === t.id)?.percentile ?? 0;
            return (
              <View key={t.id} style={styles.row}>
                <Text style={styles.rowLabel}>{t.label}</Text>
                <Text style={styles.rowScore}>{scoreLabel(p)}</Text>
                <Text style={styles.rowTop}>{topPercentLabel(p)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </NestedScreen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  kicker: { ...typography.caption, color: colors.secondary },
  title: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  overallInfo: { flex: 1, gap: spacing.xs },
  overallTop: { ...typography.stat, fontSize: 15, color: colors.tertiary },
  overallNote: { ...typography.bodySm, color: colors.textSecondary },
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
  rowScore: { ...typography.stat, color: colors.tertiary, width: 40, textAlign: 'right' },
  rowTop: { ...typography.label, color: colors.textSecondary, width: 72, textAlign: 'right' },
});
