import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { type PlanItem, workoutSessionId } from '../../types/practice';
import { getScores, topPercentLabel } from '../../services/scoring';
import { DayCompleteMoment } from '../../components/DayCompleteMoment';
import { PracticeAnimation } from '../../components/PracticeAnimation';
import { BackHeader, NestedScreen } from '../../components/BackHeader';
import { PressableScale } from '../../components/PressableScale';
import { useDayCompleteMoment } from '../../hooks/useDayCompleteMoment';
import { usePractice } from '../../store/PracticeContext';
import { colors, spacing, radii, typography } from '../../theme';

interface Props {
  item: PlanItem;
  onClose: () => void;
}

const targetLabel = (traitId: string) => {
  const score = getScores().find((s) => s.traitId === traitId);
  return score ? topPercentLabel(score.percentile) : '';
};

export function WorkoutDetailScreen({ item, onClose }: Props) {
  const { isDone } = usePractice();
  const { completeTask, visible, dismiss } = useDayCompleteMoment();
  const sessionId = workoutSessionId(item.traitId);
  const done = isDone(sessionId);

  return (
    <NestedScreen onClose={onClose} style={styles.root}>
      <BackHeader onClose={onClose} />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.kicker}>Workout · Targets {targetLabel(item.traitId)}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.blurb}>{item.blurb}</Text>

        <View style={styles.steps}>
          {item.steps?.map((step, i) => (
            <View key={step.name} style={styles.stepCard}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{i + 1}</Text>
              </View>
              <View style={styles.stepInfo}>
                <View style={styles.stepTop}>
                  <Text style={styles.stepName}>{step.name}</Text>
                  <Text style={styles.stepDuration}>{step.duration}</Text>
                </View>
                <Text style={styles.stepDetail}>{step.detail}</Text>
                {step.animation && <PracticeAnimation slug={step.animation} />}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PressableScale
          onPress={() => completeTask(sessionId)}
          disabled={done}
          style={[styles.cta, done && styles.ctaDone]}
        >
          <Text style={[styles.ctaText, done && styles.ctaTextDone]}>
            {done ? '✓ Session complete today' : 'Mark session complete'}
          </Text>
        </PressableScale>
      </View>

      {visible && <DayCompleteMoment onClose={dismiss} />}
    </NestedScreen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  kicker: { ...typography.caption, color: colors.secondary },
  title: { ...typography.display, fontSize: 26, color: colors.textPrimary, marginTop: spacing.xs },
  blurb: { ...typography.bodyMd, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg },
  steps: { gap: spacing.sm },
  stepCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: { ...typography.label, color: colors.tertiary },
  stepInfo: { flex: 1, gap: 4 },
  stepTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepName: { ...typography.h3, color: colors.textPrimary },
  stepDuration: { ...typography.caption, color: colors.textSecondary },
  stepDetail: { ...typography.bodySm, color: colors.textSecondary },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaDone: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
  ctaText: { fontSize: 15, fontWeight: '600', color: colors.onPrimary },
  ctaTextDone: { color: colors.tertiary },
});
