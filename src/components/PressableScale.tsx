import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const PRESSED_SCALE = 0.97;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const scale = useMemo(() => new Animated.Value(1), []);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  const animateTo = (toValue: number) => {
    if (reduceMotion || disabled) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 7,
      tension: 220,
    }).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={(e) => {
        animateTo(PRESSED_SCALE);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
