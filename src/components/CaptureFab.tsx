import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme';
import { CameraIcon } from './icons/OnboardingIcons';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export function CaptureFab({ onPress, disabled }: Props) {
  return (
    <View style={[styles.wrapper, disabled && styles.wrapperDisabled]}>
      <Pressable
        style={styles.fab}
        onPress={onPress}
        android_ripple={{ color: colors.onPrimary, borderless: false, radius: 28 }}
        accessibilityRole="button"
        accessibilityLabel="Take a new scan"
      >
        <CameraIcon size={26} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    zIndex: 100,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  wrapperDisabled: {
    opacity: 0.45,
  },
  fab: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
