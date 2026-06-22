import { useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { scoreLabel } from '../services/scoring';
import { colors, spacing, radii, typography } from '../theme';

export interface TimelinePoint {
  date: string;
  percentile: number;
}

interface Props {
  points: TimelinePoint[];
  emptyHint?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HEIGHT = 132;
const PAD_X = 14;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function ScoreTimeline({ points, emptyHint }: Props) {
  const [width, setWidth] = useState(0);

  if (points.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {emptyHint ?? 'Re-scan to start your score timeline — it appears after your second scan.'}
        </Text>
      </View>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const values = points.map((p) => p.percentile);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(10, rawMax - rawMin);
  const domainMin = Math.max(0, rawMin - span * 0.25);
  const domainMax = Math.min(100, rawMax + span * 0.25);
  const domain = Math.max(1, domainMax - domainMin);

  const innerW = Math.max(0, width - PAD_X * 2);
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (i: number) =>
    PAD_X + (points.length === 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
  const y = (p: number) => PAD_TOP + innerH * (1 - (p - domainMin) / domain);

  const coords = points.map((p, i) => ({ cx: x(i), cy: y(p.percentile), point: p }));
  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`)
    .join(' ');

  const first = points[0].percentile;
  const last = points[points.length - 1].percentile;
  const moved = scoreLabel(last) !== scoreLabel(first);
  const up = last >= first;

  return (
    <View style={styles.card} onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          <Line
            x1={PAD_X}
            y1={PAD_TOP + innerH}
            x2={width - PAD_X}
            y2={PAD_TOP + innerH}
            stroke={colors.border}
            strokeWidth={1}
          />
          <Path d={linePath} stroke={colors.tertiary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map((c, i) => {
            const isLast = i === coords.length - 1;
            return (
              <Circle
                key={c.point.date}
                cx={c.cx}
                cy={c.cy}
                r={isLast ? 5 : 3.5}
                fill={isLast ? colors.tertiary : colors.background}
                stroke={colors.tertiary}
                strokeWidth={2}
              />
            );
          })}
        </Svg>
      )}
      <View style={styles.axis}>
        <Text style={styles.axisLabel}>{shortDate(points[0].date)}</Text>
        <Text style={[styles.delta, moved && (up ? styles.deltaUp : styles.deltaDown)]}>
          {moved ? `${scoreLabel(first)} → ${scoreLabel(last)}` : 'Holding steady'}
        </Text>
        <Text style={styles.axisLabel}>{shortDate(points[points.length - 1].date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  axis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: PAD_X,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  delta: {
    ...typography.label,
    color: colors.textSecondary,
  },
  deltaUp: {
    color: colors.tertiary,
  },
  deltaDown: {
    color: colors.textSecondary,
  },
  empty: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});
