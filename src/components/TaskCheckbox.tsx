import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, radii, typography } from '../theme';

interface Props {
  done: boolean;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
}

export function TaskCheckbox({ done, label, onPress, showDivider }: Props) {
  const scale = useMemo(() => new Animated.Value(1), []);
  const prevDone = useRef(done);
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
    if (done && !prevDone.current && !reduceMotion) {
      scale.setValue(0.72);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 220,
        useNativeDriver: true,
      }).start();
    }
    prevDone.current = done;
  }, [done, reduceMotion, scale]);

  return (
    <Pressable
      onPress={onPress}
      disabled={done}
      style={[styles.row, showDivider && styles.divider]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
    >
      <Animated.View
        style={[
          styles.box,
          done && styles.boxDone,
          { transform: [{ scale }] },
        ]}
      >
        {done ? <Text style={styles.check}>✓</Text> : null}
      </Animated.View>
      <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDone: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
  },
  check: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onTertiary,
  },
  label: {
    ...typography.bodySm,
    color: colors.textPrimary,
    flex: 1,
  },
  labelDone: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
