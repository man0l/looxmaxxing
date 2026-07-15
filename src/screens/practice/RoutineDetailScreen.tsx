import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { type PlanItem, routineTaskId } from '../../types/practice';
import { getScores, topPercentLabel } from '../../services/scoring';
import { DayCompleteMoment } from '../../components/DayCompleteMoment';
import { BackHeader, NestedScreen } from '../../components/BackHeader';
import { TaskCheckbox } from '../../components/TaskCheckbox';
import { SegmentedProgress } from '../../components/SegmentedProgress';
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

function ChecklistSection({
  heading,
  tasks,
  traitId,
  period,
  onCompleteTask,
}: {
  heading: string;
  tasks: string[];
  traitId: string;
  period: 'am' | 'pm';
  onCompleteTask: (id: string) => void;
}) {
  const { isDone } = usePractice();
  if (tasks.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      <View style={styles.card}>
        {tasks.map((task, i) => {
          const id = routineTaskId(traitId, period, i);
          const done = isDone(id);
          return (
            <TaskCheckbox
              key={id}
              done={done}
              label={task}
              onPress={() => onCompleteTask(id)}
              showDivider={i > 0}
            />
          );
        })}
      </View>
    </View>
  );
}

export function RoutineDetailScreen({ item, onClose }: Props) {
  const { doneCountForTrait, totalCountForTrait } = usePractice();
  const { completeTask, visible, dismiss } = useDayCompleteMoment();
  const done = doneCountForTrait(item.traitId);
  const total = totalCountForTrait(item.traitId);

  return (
    <NestedScreen onClose={onClose} style={styles.root}>
      <BackHeader onClose={onClose} />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.kicker}>Routine · Targets {targetLabel(item.traitId)}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.blurb}>{item.blurb}</Text>
        <Text style={styles.progress}>
          {done} of {total} done today
        </Text>
        <SegmentedProgress done={done} total={total} />

        <View style={styles.sections}>
          <ChecklistSection
            heading="Morning"
            tasks={item.amTasks ?? []}
            traitId={item.traitId}
            period="am"
            onCompleteTask={completeTask}
          />
          <ChecklistSection
            heading="Evening"
            tasks={item.pmTasks ?? []}
            traitId={item.traitId}
            period="pm"
            onCompleteTask={completeTask}
          />
        </View>
      </ScrollView>

      {visible && <DayCompleteMoment onClose={dismiss} />}
    </NestedScreen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  kicker: { ...typography.caption, color: colors.secondary },
  title: { ...typography.display, fontSize: 26, color: colors.textPrimary, marginTop: spacing.xs },
  blurb: { ...typography.bodyMd, color: colors.textSecondary, marginTop: spacing.sm },
  progress: { ...typography.label, color: colors.tertiary, marginTop: spacing.md },
  sections: { marginTop: spacing.lg },
  section: { marginBottom: spacing.lg, gap: spacing.sm },
  sectionHeading: { ...typography.caption, color: colors.textTertiary },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
});
