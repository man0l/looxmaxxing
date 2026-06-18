import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TRAITS, type PlanId } from '../types/traits';
import { useOnboarding } from '../store/OnboardingContext';
import { useSubscription } from '../store/SubscriptionContext';
import { BlurredTraitGrid } from '../components/BlurredTraitGrid';
import { packageForPlan, perWeekLabel } from '../services/purchases';
import { colors, spacing, radii, typography } from '../theme';

const FALLBACK_PLANS: Record<PlanId, { price: string; framing: string }> = {
  annual: { price: '$39.99/yr', framing: 'just $0.77 per week' },
  weekly: { price: '$6.99/wk', framing: 'billed every week' },
};

const traitById = (id: string) => TRAITS.find((t) => t.id === id);

const FALLBACK_BENEFITS = [
  'A plan for all 7 scored traits',
  'Re-scan every 14 days to track your percentile',
];

export function PaywallScreen() {
  const { concerns } = useOnboarding();
  const { subscribe, restore, dismissPaywall, offering, purchasing } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const insets = useSafeAreaInsets();

  const plans = (['annual', 'weekly'] as PlanId[]).map((id) => {
    const pkg = offering ? packageForPlan(offering, id) : null;
    if (!pkg) {
      return { id, title: id === 'annual' ? 'Annual' : 'Weekly', ...FALLBACK_PLANS[id] };
    }
    const suffix = id === 'annual' ? '/yr' : '/wk';
    const weekly = id === 'annual' ? perWeekLabel(pkg) : null;
    return {
      id,
      title: id === 'annual' ? 'Annual' : 'Weekly',
      price: `${pkg.product.priceString}${suffix}`,
      framing: weekly ? `just ${weekly} per week` : FALLBACK_PLANS[id].framing,
    };
  });

  const teaseNoun = traitById(concerns[0] ?? 'jawline')?.teaseNoun ?? 'jawline';
  const benefits = [
    ...concerns
      .map((id) => {
        const trait = traitById(id);
        return trait ? `${trait.label} score + ${trait.plan.toLowerCase()}` : null;
      })
      .filter((b): b is string => b !== null),
    ...FALLBACK_BENEFITS,
  ].slice(0, 3);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: 40 + insets.bottom }]}
      bounces={false}
    >
      <View style={styles.topRow}>
        <Pressable onPress={dismissPaywall} hitSlop={12}>
          <Text style={styles.maybeLater}>Maybe later</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>
        Your <Text style={styles.titleAccent}>{teaseNoun}</Text> analysis is ready
      </Text>
      <Text style={styles.subtitle}>
        Unlock to see where you stand — and the plan to move it.
      </Text>

      <BlurredTraitGrid concerns={concerns} />

      <View style={styles.benefits}>
        {benefits.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Text style={styles.benefitCheck}>✓</Text>
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
            >
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planFraming}>{plan.framing}</Text>
              </View>
              <View style={styles.planRight}>
                {plan.id === 'annual' && (
                  <View style={styles.bestValue}>
                    <Text style={styles.bestValueText}>Best value</Text>
                  </View>
                )}
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => subscribe(selectedPlan)}
        style={[styles.cta, purchasing && styles.ctaDisabled]}
        disabled={purchasing}
      >
        <Text style={styles.ctaText}>{purchasing ? 'Processing…' : 'Unlock my results'}</Text>
      </Pressable>

      <Text style={styles.terms}>
        Auto-renews until canceled. Cancel anytime in Settings. Billed via your Apple ID.
      </Text>
      <Pressable onPress={restore} hitSlop={8} disabled={purchasing}>
        <Text style={styles.restore}>Restore purchases</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  maybeLater: {
    ...typography.label,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    lineHeight: 29,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  titleAccent: {
    color: colors.tertiary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  benefits: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitCheck: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.tertiary,
  },
  benefitText: {
    ...typography.bodySm,
    color: colors.textPrimary,
  },
  plans: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  planCardSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.surface,
  },
  planInfo: {
    gap: 2,
  },
  planTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  planFraming: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  planRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bestValue: {
    backgroundColor: colors.secondary,
    borderRadius: radii.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSecondary,
  },
  planPrice: {
    ...typography.stat,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  terms: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  restore: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
