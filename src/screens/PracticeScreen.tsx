import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PRACTICE_PLAN, getPlanItem, type PlanItem, workoutSessionId } from '../types/practice';
import { getScores, topPercentLabel } from '../services/scoring';
import { useOnboarding } from '../store/OnboardingContext';
import { usePractice } from '../store/PracticeContext';
import { ConcernGlyph } from '../components/icons/OnboardingIcons';
import { BrandMark } from '../components/BrandMark';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { useTabRootReset } from '../hooks/useTabRootReset';
import { WorkoutDetailScreen } from './practice/WorkoutDetailScreen';
import { RoutineDetailScreen } from './practice/RoutineDetailScreen';
import { colors, spacing, radii, typography } from '../theme';

const targetLabel = (traitId: string) => {
  const score = getScores().find((s) => s.traitId === traitId);
  return score ? topPercentLabel(score.percentile) : '';
};

function PlanCard({ item, onPress }: { item: PlanItem; onPress: () => void }) {
  const { isDone, doneCountForTrait, totalCountForTrait } = usePractice();

  let status: string;
  let complete: boolean;
  if (item.type === 'workout') {
    complete = isDone(workoutSessionId(item.traitId));
    status = complete ? 'Done today' : 'Start session';
  } else {
    const done = doneCountForTrait(item.traitId);
    const total = totalCountForTrait(item.traitId);
    complete = done === total && total > 0;
    status = `${done}/${total} today`;
  }

  return (
    <Card role="quiet" onPress={onPress} style={styles.card}>
      <View style={styles.glyphWell}>
        <ConcernGlyph id={item.traitId} size={22} color={colors.tertiary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>
          {item.type === 'workout' ? 'Workout' : 'Routine'} · Targets {targetLabel(item.traitId)}
        </Text>
      </View>
      <View style={styles.cardStatus}>
        {complete ? (
          <Text style={styles.statusDone}>✓</Text>
        ) : (
          <Text style={styles.statusPending}>{status}</Text>
        )}
      </View>
    </Card>
  );
}

export function PracticeScreen() {
  const { concerns } = useOnboarding();
  const [activeTraitId, setActiveTraitId] = useState<string | null>(null);

  useTabRootReset(useCallback(() => setActiveTraitId(null), []));

  if (activeTraitId) {
    const item = getPlanItem(activeTraitId);
    if (item) {
      const onClose = () => setActiveTraitId(null);
      return item.type === 'workout' ? (
        <WorkoutDetailScreen item={item} onClose={onClose} />
      ) : (
        <RoutineDetailScreen item={item} onClose={onClose} />
      );
    }
  }

  const planItems = concerns
    .map((id) => getPlanItem(id))
    .filter((i): i is PlanItem => i !== undefined);
  const planTraitIds = new Set(planItems.map((i) => i.traitId));
  const rest = PRACTICE_PLAN.filter((i) => !planTraitIds.has(i.traitId));

  return (
    <ScreenShell>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <BrandMark variant="monogram" height={18} />
          <Text style={styles.header}>Practice</Text>
        </View>

        {planItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Your plan</Text>
            <View style={styles.group}>
              {planItems.map((item) => (
                <PlanCard key={item.traitId} item={item} onPress={() => setActiveTraitId(item.traitId)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>
          {planItems.length > 0 ? 'More to explore' : 'Workouts & routines'}
        </Text>
        <View style={styles.group}>
          {rest.map((item) => (
            <PlanCard key={item.traitId} item={item} onPress={() => setActiveTraitId(item.traitId)} />
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  container: { paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: 110, gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  header: { ...typography.display, fontSize: 24, color: colors.textPrimary },
  sectionLabel: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.md },
  group: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  glyphWell: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardMeta: { ...typography.caption, color: colors.textSecondary },
  cardStatus: { alignItems: 'flex-end' },
  statusDone: { fontSize: 16, fontWeight: '700', color: colors.tertiary },
  statusPending: { ...typography.label, color: colors.primary },
});
