import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStreak } from '../store/StreakContext';
import { StreakHeatmap } from '../components/StreakHeatmap';
import { ShareSheet } from '../components/share/ShareSheet';
import { StreakShareCard } from '../components/share/ShareCards';
import { colors, spacing, radii, typography } from '../theme';

interface Props {
  onClose: () => void;
}

export function StreakScreen({ onClose }: Props) {
  const streak = useStreak();
  const navigation = useNavigation();
  const [showShare, setShowShare] = useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.headerBar}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.back}>‹ Results</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.title}>Your streak</Text>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.bigDay}>Day {streak.currentDay}</Text>
            <Text style={styles.milestone}>
              {streak.next
                ? `${streak.next - streak.currentDay} days to your ${streak.next}-day milestone`
                : 'Every milestone cleared 🔥'}
            </Text>
          </View>
          <Text style={styles.longest}>Longest {streak.longest}</Text>
        </View>

        <View style={styles.heatmapWrap}>
          <StreakHeatmap weeks={streak.heatmap} />
        </View>

        <Text style={styles.freeze}>
          {streak.freezeAvailable
            ? '❄  Streak freeze ready · protects one missed day this month'
            : '❄  Streak freeze used · resets next month'}
        </Text>

        <Pressable style={styles.shareBtn} onPress={() => setShowShare(true)}>
          <Text style={styles.shareText}>Share streak</Text>
        </Pressable>

        <Pressable
          style={styles.planLink}
          onPress={() => {
            onClose();
            navigation.navigate('Practice' as never);
          }}
        >
          <Text style={styles.planLinkText}>Go to today’s plan ›</Text>
        </Pressable>
      </ScrollView>

      {showShare && (
        <ShareSheet
          message={`Day ${streak.currentDay} streak on looxmaxxing`}
          onClose={() => setShowShare(false)}
        >
          <StreakShareCard day={streak.currentDay} weeks={streak.heatmap} />
        </ShareSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerBar: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  back: { ...typography.label, color: colors.primary },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  title: { ...typography.display, fontSize: 26, color: colors.textPrimary, marginBottom: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  bigDay: { ...typography.display, fontSize: 28, color: colors.textPrimary },
  milestone: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  longest: { ...typography.label, color: colors.textSecondary },
  heatmapWrap: { marginVertical: spacing.xl, alignItems: 'center' },
  freeze: { ...typography.caption, color: colors.textTertiary, textAlign: 'center' },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  shareText: { fontSize: 15, fontWeight: '600', color: colors.onPrimary },
  planLink: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs },
  planLinkText: { ...typography.label, color: colors.textSecondary },
});
