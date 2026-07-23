import { type ReactNode, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const SWIPE_DISTANCE = 64;
const SWIPE_VELOCITY = 450;

type Props = {
  children: ReactNode;
  /** True when a subpage (workout, detail, capture, etc.) covers the tab root. */
  isNested: boolean;
  /** Close nested content and return to the tab root. */
  onPopNested: () => void;
  /** Hard-disable swipe (e.g. analyzing). Default true. */
  enabled?: boolean;
};

/**
 * Horizontal swipe:
 * - Tab root → previous / next main tab (X-style).
 * - Nested subpage → pop back to that tab's root (not across tabs).
 */
export function TabSwipeHost({ children, isNested, onPopNested, enabled = true }: Props) {
  const navigation = useNavigation();
  const index = useNavigationState((s) => s.index);
  const routeNames = useNavigationState((s) => s.routes.map((r) => r.name));

  const goAdjacentTab = useCallback(
    (dir: -1 | 1) => {
      const next = index + dir;
      if (next < 0 || next >= routeNames.length) return;
      navigation.navigate(routeNames[next] as never);
    },
    [index, navigation, routeNames],
  );

  const onSwipeLeft = useCallback(() => {
    if (isNested) {
      onPopNested();
      return;
    }
    goAdjacentTab(1);
  }, [goAdjacentTab, isNested, onPopNested]);

  const onSwipeRight = useCallback(() => {
    if (isNested) {
      onPopNested();
      return;
    }
    goAdjacentTab(-1);
  }, [goAdjacentTab, isNested, onPopNested]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX([-24, 24])
        .failOffsetY([-18, 18])
        .onEnd((e) => {
          'worklet';
          const goLeft =
            e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY;
          const goRight =
            e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY;
          if (goLeft) runOnJS(onSwipeLeft)();
          else if (goRight) runOnJS(onSwipeRight)();
        }),
    [enabled, onSwipeLeft, onSwipeRight],
  );

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.fill} collapsable={false}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
