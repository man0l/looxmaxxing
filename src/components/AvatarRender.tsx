import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { ConcernGlyph } from './icons/OnboardingIcons';
import { colors, radii, spacing, typography } from '../theme';

interface Props {
  traitId: string;
  style?: string;
  size?: number;
  imageUrl?: string | null;
}

export function AvatarRender({ traitId, style, size = 132, imageUrl }: Props) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.frame, { width: size, height: size, borderRadius: radii.lg }]}
        resizeMode="cover"
      />
    );
  }

  const gradId = `grad-${traitId}`;
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: radii.lg }]}>
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
