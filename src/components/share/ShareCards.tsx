import { View, Text, StyleSheet, Image } from 'react-native';
import { StreakHeatmap } from '../StreakHeatmap';
import { RingGauge } from '../RingGauge';
import { BrandMark } from '../BrandMark';
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
  photoUri?: string;
  overallDelta?: string;
}

function isUp(delta?: string): boolean {
  return Boolean(delta && delta.startsWith('+'));
}

function isDown(delta?: string): boolean {
  return Boolean(delta && delta.startsWith('-'));
}

export function ScoreShareCard({
  overallPercentile,
  rows,
  photoUri,
  overallDelta,
}: ScoreCardProps) {
  const overallScore = scoreLabel(overallPercentile);
  const improved = isUp(overallDelta);
  const declined = isDown(overallDelta);

  return (
    <View style={styles.card}>
      <BrandMark variant="wordmark" height={22} style={styles.brand} />

      <View style={styles.overallVisual}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.heroPhoto} resizeMode="cover" />
        ) : (
          <View style={[styles.heroPhoto, styles.heroPhotoEmpty]} />
        )}
        <View style={styles.ringBadge}>
          <RingGauge
            percentile={overallPercentile}
            size={80}
            centerLabel={overallScore}
            animate={false}
          />
        </View>
      </View>

      <Text style={styles.overallPercentile}>{topPercentLabel(overallPercentile)} of men</Text>
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
            <Text style={styles.gridTop}>{topPercentLabel(r.percentile)}</Text>
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

const PHOTO_SIZE = 168;

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
    position: 'relative',
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  heroPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
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
    right: -12,
    bottom: -12,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 4,
    borderColor: colors.background,
    padding: 3,
  },
  overallPercentile: {
    ...typography.display,
    fontSize: 22,
    lineHeight: 26,
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
