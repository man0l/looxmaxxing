import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TRAITS, type TraitScore } from '../types/traits';
import { orderByConcerns, topPercentLabel, scoreLabel } from '../services/scoring';
import { colors, spacing, radii, typography } from '../theme';
import { RingGauge } from './RingGauge';

interface Props {
  concerns: string[];
  scores: TraitScore[];
  onOpenPlan: (traitId: string) => void;
}

const trait = (id: string) => TRAITS.find((t) => t.id === id);

export function TraitGrid({ concerns, scores, onOpenPlan }: Props) {
  const ordered = orderByConcerns(scores, concerns);
  const featured = ordered.filter((s) => concerns.includes(s.traitId));
  const rest = ordered.filter((s) => !concerns.includes(s.traitId));
  const featuredList = featured.length > 0 ? featured : ordered.slice(0, 2);
  const restList = featured.length > 0 ? rest : ordered.slice(2);

  return (
    <View style={styles.wrap}>
      <View style={styles.featuredGroup}>
        {featuredList.map((s) => {
          const t = trait(s.traitId);
          return (
            <Pressable
              key={s.traitId}
              style={styles.featuredCard}
              onPress={() => onOpenPlan(s.traitId)}
            >
              <RingGauge percentile={s.percentile} size={72} centerLabel={scoreLabel(s.percentile)} />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredLabel}>{t?.label ?? s.traitId}</Text>
                <Text style={styles.featuredPercentile}>{topPercentLabel(s.percentile)} of men</Text>
                <Text style={styles.cta}>{t?.plan ?? 'View plan'} ›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {restList.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>All traits</Text>
          <View style={styles.restGrid}>
            {restList.map((s) => {
              const t = trait(s.traitId);
              return (
                <Pressable
                  key={s.traitId}
                  style={styles.restCard}
                  onPress={() => onOpenPlan(s.traitId)}
                >
                  <RingGauge
                    percentile={s.percentile}
                    size={54}
                    centerLabel={scoreLabel(s.percentile)}
                  />
                  <Text style={styles.restLabel}>{t?.label ?? s.traitId}</Text>
                  <Text style={styles.restPercentile}>{topPercentLabel(s.percentile)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  featuredGroup: {
    gap: spacing.sm,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  featuredInfo: {
    flex: 1,
    gap: 3,
  },
  featuredLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  featuredPercentile: {
    ...typography.stat,
    fontSize: 15,
    color: colors.tertiary,
  },
  cta: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  restGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  restCard: {
    width: '31%',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  restLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  restPercentile: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
