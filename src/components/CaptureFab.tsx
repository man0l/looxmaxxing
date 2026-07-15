import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme';
import { CameraIcon } from './icons/OnboardingIcons';
import { PressableScale } from './PressableScale';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

const FAB_SIZE = 56;
const HALO_SIZE = FAB_SIZE + 24;
const HALO_OPACITY = 0.2;

export function CaptureFab({ onPress, disabled }: Props) {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]} pointerEvents="box-none">
      <View style={styles.halo} pointerEvents="none" />
      <PressableScale
        onPress={onPress}
        disabled={disabled}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Take a new scan"
        android_ripple={{ color: colors.onPrimary, borderless: false, radius: 28 }}
      >
        <CameraIcon size={26} color={colors.onPrimary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20 - (HALO_SIZE - FAB_SIZE) / 2,
    bottom: 24 - (HALO_SIZE - FAB_SIZE) / 2,
    width: HALO_SIZE,
    height: HALO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  containerDisabled: {
    opacity: 0.45,
  },
  halo: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    backgroundColor: `rgba(61, 107, 230, ${HALO_OPACITY})`,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
