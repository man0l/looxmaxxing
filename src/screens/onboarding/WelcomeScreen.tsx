import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

const HERO_IMAGE = require('../../../assets/images/onboarding-face-scan-image1-hero.jpg');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.scrim} />
        <View style={styles.scanBadge}>
          <View style={styles.scanDot} />
          <Text style={styles.scanBadgeText}>Scanning jawline…</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Get an honest read on your face</Text>
        <Text style={styles.subtitle}>
          Scored against other men. A plan for every trait. Your scan takes 60 seconds.
        </Text>

        <Pressable accessibilityLabel="Scan my face" onPress={onStart} style={styles.cta}>
          <Text style={styles.ctaText}>Scan my face</Text>
        </Pressable>

        <Text style={styles.trust}>Percentile-based · Photos stay private</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: SCREEN_HEIGHT * 0.55,
    width: '100%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,8,6,0.25)',
  },
  scanBadge: {
    position: 'absolute',
    bottom: 20,
    left: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(10,8,6,0.72)',
    borderRadius: radii.full,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  scanBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  subtitle: {
    ...typography.bodyMd,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  trust: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
