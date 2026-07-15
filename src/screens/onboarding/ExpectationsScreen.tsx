import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';

interface Props {
  onGotIt: () => void;
}

const BARS = [
  { height: 8, inRange: false },
  { height: 18, inRange: false },
  { height: 42, inRange: false },
  { height: 78, inRange: true },
  { height: 100, inRange: true },
  { height: 64, inRange: true },
  { height: 30, inRange: true },
  { height: 12, inRange: false },
  { height: 5, inRange: false },
];
const MAX_H = 72;

export function ExpectationsScreen({ onGotIt }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <OnboardingProgressBar current={5} />
      <Text style={styles.title}>Most guys land between 4 and 7</Text>
      <Text style={styles.subtitle}>
        You&apos;ll get percentiles, not verdicts — and every trait comes with a plan.
      </Text>

      <View style={styles.chartCard}>
        <View style={styles.barsRow}>
          {BARS.map((bar, i) => (
            <View key={i} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.round((bar.height / 100) * MAX_H),
                    backgroundColor: bar.inRange ? colors.tertiary : colors.surfaceRaised,
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabelEdge}>1</Text>
          <Text style={styles.chartLabelCenter}>4–7 · most men</Text>
          <Text style={styles.chartLabelEdge}>10</Text>
        </View>
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipIcon}>↗</Text>
        <Text style={styles.tipText}>
          A 5.7 means room to climb — re-rate every two weeks and watch the percentile move.
        </Text>
      </View>

      <View style={styles.spacer} />

      <Pressable onPress={onGotIt} style={styles.cta}>
        <Text style={styles.ctaText}>Got it</Text>
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
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 19,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: MAX_H,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    height: MAX_H,
  },
  bar: {
    borderRadius: 999,
    width: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  chartLabelEdge: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  chartLabelCenter: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
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
