import { View, StyleSheet } from 'react-native';
import type { HeatCell } from '../services/streak';
import { colors } from '../theme';

interface Props {
  weeks: HeatCell[][];
}

const LEVEL_OPACITY = [0, 0.22, 0.42, 0.68, 1];

function cellColor(cell: HeatCell): string {
  if (cell.future) return 'transparent';
  if (cell.level <= 0) return colors.surfaceInset;
  return `rgba(239, 230, 216, ${LEVEL_OPACITY[cell.level]})`;
}

export function StreakHeatmap({ weeks }: Props) {
  return (
    <View style={styles.grid}>
      {weeks.map((col, ci) => (
        <View key={ci} style={styles.col}>
          {col.map((cell) => (
            <View
              key={cell.key}
              style={[
                styles.cell,
                { backgroundColor: cellColor(cell) },
                cell.isToday && styles.today,
              ]}
            />
          ))}
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
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
});
