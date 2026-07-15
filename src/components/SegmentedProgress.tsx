import { View, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme';

interface Props {
  done: number;
  total: number;
}

/** Rounded capsule segments for routine progress (DESIGN.md progress bars). */
export function SegmentedProgress({ done, total }: Props) {
  if (total <= 0) return null;
  const segments = Math.min(total, 12);
  const filled = Math.min(done, segments);

  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {Array.from({ length: segments }, (_, i) => (
        <View
          key={i}
          style={[styles.seg, i < filled ? styles.segFilled : styles.segEmpty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.sm,
  },
  seg: {
    flex: 1,
    height: 6,
    borderRadius: radii.full,
  },
  segFilled: {
    backgroundColor: colors.tertiary,
  },
  segEmpty: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
