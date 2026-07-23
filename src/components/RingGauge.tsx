import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../theme';

// RN Animated + react-native-svg Circle is unreliable on web (AnimatedCircle
// throws). Native keeps the draw-in animation; web renders the final ring.
const AnimatedCircle =
  Platform.OS === 'web' ? null : Animated.createAnimatedComponent(Circle);

interface Props {
  percentile: number;
  size?: number;
  obscured?: boolean;
  centerLabel?: string;
  animate?: boolean;
  delayMs?: number;
}

export function RingGauge({
  percentile,
  size = 72,
  obscured = false,
  centerLabel,
  animate = true,
  delayMs = 0,
}: Props) {
  const strokeWidth = Math.max(5, Math.round(size * 0.2));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percentile)) / 100;
  const targetOffset = circumference * (1 - progress);
  const isWeb = Platform.OS === 'web';

  const offset = useMemo(() => new Animated.Value(circumference), [circumference]);
  const glow = useMemo(() => new Animated.Value(0), []);
  const [reduceMotion, setReduceMotion] = useState(false);
  const gradId = useMemo(
    () => `ring-glow-${size}-${Math.round(percentile * 10)}`,
    [size, percentile],
  );

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
    if (obscured || !animate || reduceMotion || isWeb) {
      if (!isWeb) offset.setValue(targetOffset);
      glow.setValue(obscured ? 0 : 1);
      return;
    }
    offset.setValue(circumference);
    glow.setValue(0);
    const anim = Animated.sequence([
      Animated.delay(delayMs),
      Animated.parallel([
        Animated.timing(offset, {
          toValue: targetOffset,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: 700,
          delay: 200,
          useNativeDriver: false,
        }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [
    animate,
    circumference,
    delayMs,
    glow,
    isWeb,
    obscured,
    offset,
    reduceMotion,
    targetOffset,
  ]);

  // Web: soft fade-in of the halo only (no SVG attribute animation).
  useEffect(() => {
    if (!isWeb) return;
    if (obscured || !animate || reduceMotion) {
      glow.setValue(obscured ? 0 : 1);
      return;
    }
    glow.setValue(0);
    const anim = Animated.timing(glow, {
      toValue: 1,
      duration: 500,
      delay: delayMs,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [animate, delayMs, glow, isWeb, obscured, reduceMotion]);

  const cx = size / 2;
  const cy = size / 2;
  const washOpacity = obscured ? 0 : 0.12;
  const progressShared = {
    cx,
    cy,
    r: radius,
    stroke: colors.tertiary,
    strokeWidth,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeDasharray: `${circumference} ${circumference}`,
    strokeOpacity: obscured ? 0.35 : 1,
    transform: `rotate(-90 ${cx} ${cy})`,
  };

  return (
    <View style={{ width: size, height: size }}>
      {!obscured && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: (size + 12) / 2,
              left: -6,
              top: -6,
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }),
            },
          ]}
        />
      )}
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.tertiary} stopOpacity={washOpacity} />
            <Stop offset="70%" stopColor={colors.tertiary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={radius * 0.72} fill={`url(#${gradId})`} />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {isWeb || !AnimatedCircle ? (
          <Circle {...progressShared} strokeDashoffset={targetOffset} />
        ) : (
          <AnimatedCircle {...progressShared} strokeDashoffset={offset} />
        )}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.value,
            { fontSize: size * 0.24 },
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
  halo: {
    position: 'absolute',
    backgroundColor: colors.tertiary,
  },
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
