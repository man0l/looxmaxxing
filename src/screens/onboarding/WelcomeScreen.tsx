import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

const HERO_IMAGE = require('../../../assets/images/onboarding-face-scan-image1-hero.jpg');

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroImageContainer}>
          <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
        </View>
        <Text style={styles.title}>Get an honest read on your face</Text>
        <Text style={styles.subtitle}>
          — and a plan to improve it. Scores compared to other men, with a
          routine for every trait.
        </Text>
      </View>

      <Pressable accessibilityLabel="Lets start" onPress={onStart} style={styles.cta}>
        <Text style={styles.ctaText}>Let’s start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.display,
    fontSize: 25,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.bodyMd,
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
