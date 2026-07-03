import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../config/legal';
import type { PlanId } from '../types/traits';
import { useOnboarding } from '../store/OnboardingContext';
import { useSubscription } from '../store/SubscriptionContext';
import { BlurredTraitGrid } from '../components/BlurredTraitGrid';
import { packageForPlan, perWeekLabel } from '../services/purchases';
import { colors, spacing, radii, typography } from '../theme';

const FALLBACK_PLANS: Record<PlanId, { price: string; perWeek: string | null }> = {
  annual: { price: '$49.99/year', perWeek: '$0.96/week' },
  weekly: { price: '$4.99', perWeek: null },
};

function savedPerYear(weeklyPkg: ReturnType<typeof packageForPlan>, annualPkg: ReturnType<typeof packageForPlan>): string | null {
  if (!weeklyPkg || !annualPkg) return null;
  const weeklyPrice = weeklyPkg.product.price;
  const annualPrice = annualPkg.product.price;
  const saved = Math.round(weeklyPrice * 52 - annualPrice);
  if (saved <= 0) return null;
  return `Save $${saved}/year`;
}

export function PaywallScreen() {
  const { concerns, frontPhoto } = useOnboarding();
  const { subscribe, restore, dismissPaywall, offering, offeringError, reloadOffering, purchasing } =
    useSubscription();
  const plansReady = Boolean(offering);
  const plansFailed = !plansReady && Boolean(offeringError);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const insets = useSafeAreaInsets();

  const annualPkg = offering ? packageForPlan(offering, 'annual') : null;
  const weeklyPkg = offering ? packageForPlan(offering, 'weekly') : null;

  const annualPerWeek = annualPkg ? perWeekLabel(annualPkg) : FALLBACK_PLANS.annual.perWeek;
  const savingsBadge = savedPerYear(weeklyPkg, annualPkg) ?? 'Save $469/year';

  const plans: { id: PlanId; title: string; price: string; sub: string | null }[] = [
    {
      id: 'annual',
      title: 'Yearly',
      price: annualPkg ? `${annualPkg.product.priceString}/year` : FALLBACK_PLANS.annual.price,
      sub: annualPerWeek ? `${annualPerWeek}/week` : null,
    },
    {
      id: 'weekly',
      title: 'Weekly',
      price: weeklyPkg ? weeklyPkg.product.priceString : FALLBACK_PLANS.weekly.price,
      sub: null,
    },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: 32 + insets.bottom }]}
      bounces={false}
    >
      <View style={styles.topRow}>
        <Pressable onPress={dismissPaywall} hitSlop={12}>
          <Text style={styles.maybeLater}>Maybe later</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Get Pro</Text>
      <Text style={styles.subtitle}>
        Unlock your full potential with AI-powered facial analysis and personalized insights.
      </Text>

      {frontPhoto ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: frontPhoto }} style={styles.photo} />
        </View>
      ) : null}

      <Text style={styles.unlockLabel}>Subscribe to unlock your full scan results</Text>

      <BlurredTraitGrid concerns={concerns} />

      <View style={styles.plans}>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
            >
              {plan.id === 'annual' && isSelected && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>{savingsBadge}</Text>
                </View>
              )}
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                  {plan.title}
                </Text>
                {plan.sub ? (
                  <Text style={styles.planSub}>{plan.sub}</Text>
                ) : null}
              </View>
              <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                {plan.price}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        testID="paywall-unlock"
        onPress={() => (plansReady ? subscribe(selectedPlan) : reloadOffering())}
        style={[styles.cta, (purchasing || (!plansReady && !plansFailed)) && styles.ctaDisabled]}
        disabled={purchasing || (!plansReady && !plansFailed)}
      >
        <Text style={styles.ctaText}>
          {purchasing
            ? 'Processing…'
            : plansReady
              ? 'Continue'
              : plansFailed
                ? 'Retry loading plans'
                : 'Loading plans…'}
        </Text>
      </Pressable>

      {plansFailed ? <Text style={styles.plansError}>{offeringError}</Text> : null}

      <View style={styles.footer}>
        <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
          <Text style={styles.footerLink}>Terms</Text>
        </Pressable>
        <Text style={styles.footerDot}>•</Text>
        <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} hitSlop={8}>
          <Text style={styles.footerLink}>Privacy</Text>
        </Pressable>
        <Text style={styles.footerDot}>•</Text>
        <Pressable onPress={restore} hitSlop={8} disabled={purchasing}>
          <Text style={styles.footerLink}>Restore Purchases</Text>
        </Pressable>
      </View>
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
    paddingTop: 52,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  maybeLater: {
    ...typography.label,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  photoWrap: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.tertiary,
    marginBottom: spacing.md,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  unlockLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.surface,
  },
  savingsBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSecondary,
  },
  planInfo: {
    gap: 2,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  planTitleSelected: {
    color: colors.textPrimary,
  },
  planSub: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  planPriceSelected: {
    color: colors.textPrimary,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  plansError: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  footerLink: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
