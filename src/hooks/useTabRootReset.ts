import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * When the user re-taps the already-focused tab, pop any in-tab nested
 * surface back to the tab root. Overlay-state details are not stack screens,
 * so React Navigation will not reset them on its own.
 */
export function useTabRootReset(reset: () => void) {
  const navigation = useNavigation();

  useEffect(() => {
    const unsub = navigation.addListener('tabPress' as never, () => {
      if (navigation.isFocused()) {
        reset();
      }
    });
    return unsub;
  }, [navigation, reset]);
}
