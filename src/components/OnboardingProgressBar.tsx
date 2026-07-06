import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Props {
  current: number;
  total?: number;
}

export function OnboardingProgressBar({ current, total = 10 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, i < current ? styles.filled : styles.empty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 26,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  filled: {
    backgroundColor: colors.tertiary,
  },
  empty: {
    backgroundColor: colors.surfaceRaised,
  },
});
