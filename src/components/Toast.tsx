import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../theme';

export type ToastVariant = 'error' | 'success' | 'info';

export interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
}

const ACCENT: Record<ToastVariant, string> = {
  error: colors.danger,
  success: colors.primary,
  info: colors.secondary,
};

const GLYPH: Record<ToastVariant, string> = {
  error: '!',
  success: '✓',
  info: 'i',
};

const DURATION: Record<ToastVariant, number> = {
  error: 5000,
  success: 3500,
  info: 3500,
};

export function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const anim = useMemo(() => new Animated.Value(0), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [anim, onClose]);

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 16,
      stiffness: 200,
    }).start();
    timer.current = setTimeout(dismiss, DURATION[toast.variant]);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast, anim, dismiss]);

  if (!toast) return null;

  const accent = ACCENT[toast.variant];

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + spacing.sm }]}>
      <Animated.View
        style={[
          styles.toast,
          {
            borderLeftColor: accent,
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
            ],
          },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Text style={styles.badgeText}>{GLYPH[toast.variant]}</Text>
        </View>
        <Text style={styles.message} numberOfLines={4}>
          {toast.message}
        </Text>
        <Pressable onPress={dismiss} hitSlop={10}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    ...typography.bodySm,
    color: colors.textPrimary,
    flex: 1,
  },
  close: {
    ...typography.bodySm,
    color: colors.textTertiary,
    fontWeight: '600',
    paddingLeft: spacing.xs,
  },
});
