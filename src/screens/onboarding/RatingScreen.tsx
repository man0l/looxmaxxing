import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

const TESTIMONIAL = {
  stars: 5,
  title: 'This app changed my life',
  body: "I've been using LooxMaxxing for 3 months now and the transformation is insane. My jawline is so much more defined and my face looks way more structured. The daily routines are actually manageable and the AI keeps track of everything. Best investment I've made in myself.",
  handle: '@billyboy44',
};

interface Props {
  onContinue: () => void;
}

export function RatingScreen({ onContinue }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Give us a rating</Text>
        <Text style={styles.subtitle}>
          Your feedback really helps us improve and reach more people who need LooxMaxxing.
        </Text>

        <View style={styles.card}>
          <Text style={styles.stars}>{'★'.repeat(TESTIMONIAL.stars)}</Text>
          <Text style={styles.cardTitle}>{TESTIMONIAL.title}</Text>
          <Text style={styles.cardBody}>{TESTIMONIAL.body}</Text>
          <Text style={styles.handle}>{TESTIMONIAL.handle}</Text>
        </View>
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
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
    gap: spacing.sm,
  },
  stars: {
    fontSize: 20,
    color: '#F5B731',
    letterSpacing: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardBody: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  handle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
