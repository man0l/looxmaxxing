import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useStreak } from '../store/StreakContext';
import { ShareSheet } from './share/ShareSheet';
import { StreakShareCard } from './share/ShareCards';
import { colors, spacing, radii, typography } from '../theme';

interface Props {
  onClose: () => void;
}

export function DayCompleteMoment({ onClose }: Props) {
  const streak = useStreak();
  const [showShare, setShowShare] = useState(false);

  const milestone =
    streak.next != null
      ? `${streak.next - streak.currentDay} days to your ${streak.next}-day milestone`
      : 'Every milestone cleared';

  return (
    <>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.kicker}>All done for today</Text>
          <Text style={styles.day}>Day {streak.currentDay}</Text>
          <Text style={styles.sub}>Your streak is still growing.</Text>
          <Text style={styles.milestone}>{milestone}</Text>

          <Pressable style={styles.shareBtn} onPress={() => setShowShare(true)}>
            <Text style={styles.shareText}>Share streak</Text>
          </Pressable>
          <Pressable style={styles.continueBtn} onPress={onClose}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        </View>
      </View>

      {showShare && (
        <ShareSheet
          message={`Day ${streak.currentDay} streak on axend`}
          onClose={() => setShowShare(false)}
        >
          <StreakShareCard day={streak.currentDay} weeks={streak.heatmap} />
        </ShareSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 6, 4, 0.72)',
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  kicker: {
    ...typography.caption,
    color: colors.tertiary,
    marginBottom: spacing.xs,
  },
  day: {
    ...typography.display,
    fontSize: 40,
    color: colors.textPrimary,
  },
  sub: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  milestone: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  shareBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  continueBtn: {
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  continueText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});