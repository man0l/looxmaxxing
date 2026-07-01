import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

const TIPS = [
  { icon: '📷', title: 'Use Good Lighting', body: 'Make sure your face is well-lit, preferably with natural light' },
  { icon: '👁', title: 'Face Forward', body: 'Look directly at the camera with a neutral expression' },
  { icon: '🎯', title: 'Clear Background', body: 'Use a plain background to ensure accurate analysis' },
  { icon: '🖼', title: 'High Quality', body: 'Use a clear, high-resolution photo for best results' },
];

interface Props {
  onContinue: () => void;
}

export function CaptureInstructionsScreen({ onContinue }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Instructions</Text>
      <Text style={styles.title}>How to Take the Perfect Scan</Text>

      <View style={styles.tips}>
        {TIPS.map((tip) => (
          <View key={tip.title} style={styles.tip}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <View style={styles.tipBody}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.body}</Text>
            </View>
          </View>
        ))}
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
  },
  header: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
    lineHeight: 30,
  },
  tips: {
    flex: 1,
    gap: spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tipIcon: {
    fontSize: 22,
    width: 36,
    textAlign: 'center',
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tipText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 19,
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
