import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  /** When true, loop the sweep. Default true. */
  loop?: boolean;
}

/**
 * Signature scan motif: monoline face contour + primary-blue sweep line
 * (DESIGN.md scan-motif). Pauses briefly mid-sweep (eyes / jaw).
 */
export function ScanMotif({ size = 140, loop = true }: Props) {
  const progress = useMemo(() => new Animated.Value(0), []);
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
      progress.setValue(0.45);
      return;
    }
    const down = Animated.sequence([
      Animated.timing(progress, {
        toValue: 0.38,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(180),
      Animated.timing(progress, {
        toValue: 0.72,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(160),
      Animated.timing(progress, {
        toValue: 1,
        duration: 450,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(280),
    ]);
    const up = Animated.timing(progress, {
      toValue: 0,
      duration: 900,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    const anim = loop
      ? Animated.loop(Animated.sequence([down, up, Animated.delay(200)]))
      : down;
    anim.start();
    return () => anim.stop();
  }, [loop, progress, reduceMotion]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [size * 0.12, size * 0.78],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M50 12 C34 12 24 24 24 40 C24 52 30 60 38 66 C32 70 28 78 28 88"
          stroke={colors.tertiary}
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
        <Path
          d="M50 12 C66 12 76 24 76 40 C76 52 70 60 62 66 C68 70 72 78 72 88"
          stroke={colors.tertiary}
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
        <Path
          d="M38 66 C42 72 58 72 62 66"
          stroke={colors.tertiary}
          strokeWidth={1.3}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
        <Circle cx={38} cy={40} r={2.2} fill={colors.tertiary} opacity={0.55} />
        <Circle cx={62} cy={40} r={2.2} fill={colors.tertiary} opacity={0.55} />
        <Path
          d="M44 50 C48 54 52 54 56 50"
          stroke={colors.tertiary}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Circle cx={50} cy={18} r={1.1} fill={colors.secondary} opacity={0.45} />
        <Circle cx={28} cy={36} r={0.9} fill={colors.secondary} opacity={0.35} />
        <Circle cx={72} cy={36} r={0.9} fill={colors.secondary} opacity={0.35} />
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.scanLine,
          {
            width: size * 0.62,
            left: size * 0.19,
            transform: [{ translateY }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
