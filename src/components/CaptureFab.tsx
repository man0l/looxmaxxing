import { Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';
import { CameraIcon } from './icons/OnboardingIcons';

interface Props {
  onPress: () => void;
}

export function CaptureFab({ onPress }: Props) {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      android_ripple={{ color: colors.onPrimary, borderless: true }}
      accessibilityRole="button"
      accessibilityLabel="Take a new scan"
    >
      <CameraIcon size={26} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
