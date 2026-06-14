import { View, Text, StyleSheet } from 'react-native';
import { StreakHeatmap } from '../StreakHeatmap';
import { RingGauge } from '../RingGauge';
import { scoreLabel, topPercentLabel } from '../../services/scoring';
import type { HeatCell } from '../../services/streak';
import { colors, spacing, radii, typography } from '../../theme';

interface StreakCardProps {
  day: number;
  weeks: HeatCell[][];
}

export function StreakShareCard({ day, weeks }: StreakCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.brand}>looxmaxxing</Text>
      <Text style={styles.bigNumber}>{day}</Text>
      <Text style={styles.bigLabel}>day streak</Text>
      <View style={styles.heatmap}>
        <StreakHeatmap weeks={weeks} />
      </View>
      <Text style={styles.footer}>looxmaxxing.app</Text>
    </View>
  );
}

interface ScoreRow {
  label: string;
  percentile: number;
}

interface ScoreCardProps {
  overall: string;
  rows: ScoreRow[];
}

export function ScoreShareCard({ overall, rows }: ScoreCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.brand}>looxmaxxing</Text>
      <Text style={styles.scanLabel}>My scan</Text>
      <Text style={styles.bigNumber}>{overall}</Text>
      <Text style={styles.bigLabel}>overall</Text>
      <View style={styles.grid}>
        {rows.map((r) => (
          <View key={r.label} style={styles.gridItem}>
            <RingGauge percentile={r.percentile} size={46} centerLabel={scoreLabel(r.percentile)} />
            <Text style={styles.gridLabel}>{r.label}</Text>
            <Text style={styles.gridTop}>{topPercentLabel(r.percentile)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>looxmaxxing.app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 264,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    ...typography.label,
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  scanLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bigNumber: {
    ...typography.display,
    fontSize: 64,
    lineHeight: 68,
    color: colors.tertiary,
  },
  bigLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heatmap: {
    marginTop: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.xl,
    rowGap: spacing.lg,
    columnGap: spacing.sm,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  gridTop: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxl,
  },
});
