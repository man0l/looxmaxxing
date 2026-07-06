import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import {
  InstagramIcon,
  XIcon,
  WhatsAppIcon,
  TikTokIcon,
} from '../../components/icons/SocialIcons';

interface Props {
  onContinue: () => void;
}

const PLATFORMS: { key: string; label: string; Icon: typeof XIcon }[] = [
  { key: 'instagram', label: 'Stories', Icon: InstagramIcon },
  { key: 'x', label: 'X', Icon: XIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
];

export function ShareMotivationScreen({ onContinue }: Props) {
  return (
    <View style={styles.container}>
      <OnboardingProgressBar current={10} />
      <View style={styles.content}>
        <Text style={styles.title}>Share your progress, your way</Text>
        <Text style={styles.subtitle}>
          Every scan comes with a share-ready card — percentile only, never a raw
          verdict. Post it, send it to a friend, or keep it to yourself. Up to you.
        </Text>

        <View style={styles.card}>
          <View style={styles.iconRow}>
            {PLATFORMS.map(({ key, label, Icon }) => (
              <View key={key} style={styles.iconItem}>
                <View style={styles.iconWell}>
                  <Icon size={26} color={colors.tertiary} />
                </View>
                <Text style={styles.iconLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.cardHint}>
            One tap from Results — straight into the app of your choice.
          </Text>
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipIcon}>↗</Text>
          <Text style={styles.tipText}>
            Guys who share their re-scans tend to stick with their routine
            longer — a public step forward is a good reason to keep going.
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <Pressable onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 32,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  iconWell: {
    width: 54,
    height: 54,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardHint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 18,
    color: colors.tertiary,
    marginTop: 1,
  },
  tipText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 19,
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
});
