import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';

interface Props {
  onContinue: () => void;
}

export function CommitmentScreen({ onContinue }: Props) {
  return (
    <View style={styles.container}>
      <OnboardingProgressBar current={8} />
      <View style={styles.content}>
        <Text style={styles.headline}>
          {'Show up daily and your score moves'}
        </Text>
        <Text style={styles.subtext}>
          Users who stick to their personalized plan see real progress within the first 2 months.
        </Text>
      </View>

      <Pressable onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>I&apos;m in — let&apos;s go</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 34,
    marginBottom: spacing.lg,
  },
  subtext: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
