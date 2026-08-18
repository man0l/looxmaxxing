import { View, Text, StyleSheet } from 'react-native';
import { StreakHeatmap } from '../StreakHeatmap';
import { RingGauge } from '../RingGauge';
import { BrandMark } from '../BrandMark';
import { scoreLabel, bandLabel, scoreOutOfTen } from '../../services/scoring';
import type { HeatCell } from '../../services/streak';
import { colors, spacing, radii, typography } from '../../theme';

interface StreakCardProps {
  day: number;
  weeks: HeatCell[][];
}

export function StreakShareCard({ day, weeks }: StreakCardProps) {
  return (
    <View style={styles.card}>
      <BrandMark variant="wordmark" height={22} style={styles.brand} />
      <Text style={styles.bigNumber}>{day}</Text>
      <Text style={styles.bigLabel}>day streak</Text>
      <View style={styles.heatmap}>
        <StreakHeatmap weeks={weeks} />
      </View>
    </View>
  );
}

interface ScoreRow {
  label: string;
  percentile: number;
  delta?: string;
}

interface ScoreCardProps {
  overallPercentile: number;
  rows: ScoreRow[];
  overallDelta?: string;
}

function isUp(delta?: string): boolean {
  return Boolean(delta && delta.startsWith('+'));
}

function isDown(delta?: string): boolean {
  return Boolean(delta && delta.startsWith('-'));
}

// Deliberately photo-free. A shareable card that pairs somebody's face with
// appearance scores reads as rating a real person, which App Review flagged
// under guideline 1.2. The card shares progress on the user's own baseline and
// nothing that identifies them — do not reintroduce a photo here.
export function ScoreShareCard({
  overallPercentile,
  rows,
  overallDelta,
}: ScoreCardProps) {
  const overallScore = scoreLabel(overallPercentile);
  const improved = isUp(overallDelta);
  const declined = isDown(overallDelta);

  return (
    <View style={styles.card}>
      <BrandMark variant="wordmark" height={22} style={styles.brand} />

      <View style={styles.overallVisual}>
        <RingGauge
          percentile={overallPercentile}
          size={132}
          centerLabel={overallScore}
          animate={false}
        />
      </View>

      <Text style={styles.overallPercentile}>My baseline · {scoreOutOfTen(overallPercentile)}</Text>
      <Text style={styles.overallCaption}>Tracking my own progress with Axend</Text>
      {overallDelta ? (
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
      ) : null}

      <View style={styles.grid}>
        {rows.map((r) => (
          <View key={r.label} style={styles.gridItem}>
            <RingGauge
              percentile={r.percentile}
              size={46}
              centerLabel={scoreLabel(r.percentile)}
              animate={false}
            />
            <Text style={styles.gridLabel}>{r.label}</Text>
            <Text style={styles.gridTop}>{bandLabel(r.percentile)}</Text>
            {r.delta ? (
              <Text
                style={[
                  styles.gridDelta,
                  isUp(r.delta) && styles.deltaUp,
                  isDown(r.delta) && styles.deltaDown,
                ]}
              >
                {isUp(r.delta) ? '▲ ' : isDown(r.delta) ? '▼ ' : ''}
                {r.delta}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    marginBottom: spacing.lg,
  },
  overallVisual: {
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  overallPercentile: {
    ...typography.display,
    fontSize: 22,
    lineHeight: 26,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  overallCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  deltaChip: {
    alignSelf: 'center',
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.surfaceInset,
    marginTop: spacing.sm,
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
  gridDelta: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  deltaUp: {
    color: colors.tertiary,
  },
  deltaDown: {
    color: colors.textSecondary,
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
});
