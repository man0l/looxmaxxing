import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../theme';

interface Props {
  percentile: number;
  size?: number;
  obscured?: boolean;
  centerLabel?: string;
}

export function RingGauge({ percentile, size = 72, obscured = false, centerLabel }: Props) {
  const strokeWidth = Math.max(4, size * 0.085);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percentile)) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.tertiary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          strokeOpacity={obscured ? 0.4 : 1}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text
          style={[
            styles.value,
            { fontSize: size * 0.26 },
            obscured && styles.valueObscured,
          ]}
        >
          {centerLabel ?? `${percentile}%`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.stat,
    color: colors.tertiary,
    lineHeight: undefined,
  },
  valueObscured: {
    opacity: 0.15,
  },
});
