import { type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useNestedBack } from '../hooks/useNestedBack';

interface Props {
  onClose: () => void;
  /** Prefer plain "Back" — parent-tab breadcrumbs feel like dead hierarchy. */
  label?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Shared nested-screen chrome: Back control + hardware/edge-swipe to close.
 * Wrap the full screen body as children so swipe works on the whole surface edge.
 */
export function BackHeader({ onClose, label = 'Back', style }: Props) {
  return (
    <View style={[styles.headerBar, style]}>
      <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={label}>
        <Text style={styles.back}>‹ {label}</Text>
      </Pressable>
    </View>
  );
}

/** Full-screen wrapper: edge swipe + Android back. */
export function NestedScreen({
  onClose,
  children,
  style,
}: {
  onClose: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const swipe = useNestedBack(onClose);

  return (
    <View style={[{ flex: 1 }, style]} {...swipe}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  back: {
    ...typography.label,
    color: colors.primary,
  },
});
