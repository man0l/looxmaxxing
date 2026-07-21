import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { ConcernGlyph } from './icons/OnboardingIcons';
import { colors, radii, spacing, typography } from '../theme';

interface Props {
  traitId: string;
  style?: string;
  size?: number;
  imageUrl?: string | null;
}

// There's no low-res pass from the render backend yet (see BE3), so this
// approximates a blur-up by de-blurring the loaded image itself in steps
// instead of hard-cutting from the placeholder straight to a sharp image.
const BLUR_STEPS = [14, 8, 3, 0];
const BLUR_STEP_MS = 90;
const REVEAL_MS = BLUR_STEPS.length * BLUR_STEP_MS;

export function AvatarRender({ traitId, style, size = 132, imageUrl }: Props) {
  const gradId = `grad-${traitId}`;
  const revealAnim = useMemo(() => new Animated.Value(imageUrl ? 1 : 0), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [blurRadius, setBlurRadius] = useState(imageUrl ? 0 : BLUR_STEPS[0]);
  const shownUrl = useRef<string | null>(imageUrl ?? null);
  const revealedOnce = useRef(Boolean(imageUrl));

  useEffect(() => {
    if (!imageUrl || imageUrl === shownUrl.current) return;
    shownUrl.current = imageUrl;

    if (!revealedOnce.current) {
      // First frame ever (placeholder → image): the full pop-in + de-blur.
      revealedOnce.current = true;
      revealAnim.setValue(0);
      setBlurRadius(BLUR_STEPS[0]);
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: REVEAL_MS,
        useNativeDriver: true,
      }).start();
      const timers = BLUR_STEPS.map((radius, i) =>
        setTimeout(() => setBlurRadius(radius), i * BLUR_STEP_MS),
      );
      return () => timers.forEach(clearTimeout);
    }

    // A sharper frame replaced one that's already visible (e.g. a later
    // streamed partial, or the final result). Stay fully visible and
    // unblurred instead of resetting opacity/blur back to the start —
    // that reset was making every new frame flash back to blank/blurry
    // before re-revealing, instead of one continuous sharpening.
    setBlurRadius(0);
  }, [imageUrl, revealAnim]);

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: radii.lg }]}>
      {imageUrl ? (
        <Animated.Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, opacity: revealAnim }}
          resizeMode="cover"
          blurRadius={blurRadius}
        />
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3A2A1A" />
              <Stop offset="1" stopColor="#1A140D" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill={`url(#${gradId})`} />
          <Circle cx="50" cy="40" r="17" fill="none" stroke={colors.tertiary} strokeWidth="2" />
          <Path
            d="M20 92 C20 70 32 60 50 60 C68 60 80 70 80 92"
            fill="none"
            stroke={colors.tertiary}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      )}
      <View style={styles.badge}>
        <ConcernGlyph id={traitId} size={14} color={colors.tertiary} />
      </View>
      {style ? (
        <View style={styles.styleChip}>
          <Text style={styles.styleText}>{style}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInset,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: 'rgba(8,6,4,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleChip: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(8,6,4,0.6)',
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  styleText: {
    ...typography.caption,
    color: colors.tertiary,
  },
});
