import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, spacing, radii, typography } from '../../theme';

interface Props {
  onGotIt: () => void;
}

const BAR_HEIGHTS = [8, 18, 42, 78, 100, 64, 30, 12, 5];
const BAR_HEIGHT_MAX = 100;
const SVG_HEIGHT = 90;
const SVG_WIDTH = 240;
const BAR_WIDTH = 16;
const BAR_GAP = 10;
const TOTAL_BARS_WIDTH = BAR_HEIGHTS.length * BAR_WIDTH + (BAR_HEIGHTS.length - 1) * BAR_GAP;
const BAR_START_X = (SVG_WIDTH - TOTAL_BARS_WIDTH) / 2;

const IN_RANGE_START = 2;
const IN_RANGE_END = 6;

export function ExpectationsScreen({ onGotIt }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.step}>Step 4 of 5</Text>
      <Text style={styles.title}>Most guys land between 4 and 7</Text>
      <Text style={styles.subtitle}>
        You’ll get percentiles, not verdicts — and every trait comes with a plan.
      </Text>

      <View style={styles.chartCard}>
        <Svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT + 24}`} width="100%" height={SVG_HEIGHT + 24}>
          {BAR_HEIGHTS.map((h, i) => {
            const scaledH = (h / BAR_HEIGHT_MAX) * SVG_HEIGHT;
            const x = BAR_START_X + i * (BAR_WIDTH + BAR_GAP);
            const inRange = i >= IN_RANGE_START && i <= IN_RANGE_END;
            return (
              <Rect
                key={i}
                x={x}
                y={SVG_HEIGHT - scaledH}
                width={BAR_WIDTH}
                height={scaledH}
                rx={4}
                fill={inRange ? colors.tertiary : colors.surfaceRaised}
              />
            );
          })}
        </Svg>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabelEdge}>1</Text>
          <Text style={styles.chartLabelCenter}>4–7 · most men</Text>
          <Text style={styles.chartLabelEdge}>10</Text>
        </View>
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipIcon}>↗</Text>
        <Text style={styles.tipText}>
          A 5.7 means room to climb — re-rate every two weeks and watch the
          percentile move.
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  step: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  subtitle: {
    ...typography.bodySm,
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
