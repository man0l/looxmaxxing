import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import { Card } from '../../components/Card';
import { PressableScale } from '../../components/PressableScale';
import { PRIVACY_POLICY_URL } from '../../config/legal';
import { useAiShareConsent } from '../../store/AiShareConsentContext';

interface Props {
  onAgree: () => void;
  onDecline: () => void;
  embedded?: boolean;
}

const BULLETS = [
  'Front and profile photos of your face, so OpenAI can compute your trait scores.',
  'If you open Avatars, your front photo, so OpenAI can generate a stylized preview.',
  'Photos are deleted from our servers immediately after. OpenAI does not keep them or use them to train models.',
];

export function AiShareConsentScreen({ onAgree, onDecline, embedded = false }: Props) {
  const { grant } = useAiShareConsent();

  return (
    <ScrollView
      testID="ai-share-consent"
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      {!embedded && <OnboardingProgressBar current={10} />}
      <Text style={styles.title}>We send your photos to OpenAI</Text>
      <Text style={styles.subtitle}>
        Scoring and Avatars use a third-party AI. Please read this before we send anything.
      </Text>

      <Card role="quiet" style={styles.card}>
        {BULLETS.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.hint}>You can turn this off anytime in Profile → Privacy.</Text>

      <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} hitSlop={8}>
        <Text style={styles.policy}>Privacy policy</Text>
      </Pressable>

      <View style={styles.spacer} />

      <PressableScale
        testID="ai-share-agree"
        accessibilityRole="button"
        accessibilityLabel="Agree and continue"
        onPress={() => {
          grant();
          onAgree();
        }}
        style={styles.cta}
      >
        <Text style={styles.ctaText}>Agree and continue</Text>
      </PressableScale>
      <Pressable
        testID="ai-share-decline"
        accessibilityRole="button"
        accessibilityLabel="Don't send"
        onPress={onDecline}
        style={styles.decline}
      >
        <Text style={styles.declineText}>Don&apos;t send</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: 40,
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
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  card: {
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bulletMark: {
    ...typography.bodyMd,
    color: colors.tertiary,
    lineHeight: 22,
  },
  bulletText: {
    ...typography.bodyMd,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  hint: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  policy: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.md,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  decline: {
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  declineText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
