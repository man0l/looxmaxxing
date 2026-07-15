import { useEffect, useMemo } from 'react';
import { BackHandler, type GestureResponderHandlers, PanResponder } from 'react-native';

/**
 * Android hardware back + iOS-style edge swipe to leave an in-tab nested surface.
 */
export function useNestedBack(onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose, enabled]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (e) => enabled && e.nativeEvent.pageX <= 28,
        onMoveShouldSetPanResponder: (e, g) =>
          enabled && e.nativeEvent.pageX <= 48 && g.dx > 10 && Math.abs(g.dy) < 24,
        onPanResponderRelease: (_, g) => {
          if (enabled && g.dx > 56 && Math.abs(g.dy) < 48) {
            onClose();
          }
        },
      }),
    [onClose, enabled],
  );

  return pan.panHandlers as GestureResponderHandlers;
}
