import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

interface Props {
  onGoBack: () => void;
}

export function IneligibleAgeScreen({ onGoBack }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.spacerTop} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>17+</Text>
      </View>

      <Text style={styles.title}>Axend is for ages 17 and up</Text>
      <Text style={styles.subtitle}>
        We&apos;re not able to offer this experience below that age. Check back once
        you&apos;re eligible.
      </Text>

      <View style={styles.spacer} />

      <Pressable onPress={onGoBack} style={styles.cta}>
        <Text style={styles.ctaText}>Go back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  spacerTop: {
    height: spacing.xl,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  badgeText: {
    ...typography.label,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  cta: {
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
