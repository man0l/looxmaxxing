import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import type { HeatCell } from '../services/streak';
import { colors } from '../theme';

interface Props {
  weeks: HeatCell[][];
}

/** Ember → cream intensity (commitment altar, not GitHub green). */
const LEVEL_COLORS = [
  colors.surfaceInset,
  'rgba(242, 84, 48, 0.28)',
  'rgba(201, 158, 111, 0.55)',
  'rgba(239, 230, 216, 0.72)',
  'rgba(239, 230, 216, 1)',
];

function cellColor(cell: HeatCell): string {
  if (cell.future) return 'transparent';
  if (cell.level <= 0) return LEVEL_COLORS[0];
  return LEVEL_COLORS[Math.min(4, cell.level)];
}

function TodayCell({ color }: { color: string }) {
  const pulse = useMemo(() => new Animated.Value(1), []);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.cell,
        styles.today,
        { backgroundColor: color, transform: [{ scale: pulse }] },
      ]}
    />
  );
}

export function StreakHeatmap({ weeks }: Props) {
  return (
    <View style={styles.grid}>
      {weeks.map((col, ci) => (
        <View key={ci} style={styles.col}>
          {col.map((cell) =>
            cell.isToday && !cell.future ? (
              <TodayCell key={cell.key} color={cellColor(cell)} />
            ) : (
              <View
                key={cell.key}
                style={[styles.cell, { backgroundColor: cellColor(cell) }]}
              />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  col: {
    gap: 4,
  },
  cell: {
    width: 13,
    height: 13,
    borderRadius: 3,
  },
  today: {
    borderWidth: 1.5,
    borderColor: colors.tertiary,
  },
});
