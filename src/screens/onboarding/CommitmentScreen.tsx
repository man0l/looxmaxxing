import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

interface Props {
  onContinue: () => void;
}

export function CommitmentScreen({ onContinue }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>
          {"If you don't follow the plan we give you, you can't blame us if you don't see progress!"}
        </Text>
        <Text style={styles.subtext}>
          LooxMaxxing users see incredible growth in the first 2 months when they stick to their personalized plan.
        </Text>
      </View>

      <Pressable onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>I understand — let's go</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
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
