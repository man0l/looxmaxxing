import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../config/legal';
import type { PlanId } from '../types/traits';
import { useOnboarding } from '../store/OnboardingContext';
import { useSubscription } from '../store/SubscriptionContext';
import { BlurredTraitGrid } from '../components/BlurredTraitGrid';
import { ScreenShell } from '../components/ScreenShell';
import { PressableScale } from '../components/PressableScale';
import { BronzeMetal } from '../components/BronzeMetal';
import { CelestialOrnament } from '../components/CelestialOrnament';
import { packageForPlan, perWeekLabel } from '../services/purchases';
import { colors, spacing, radii, typography } from '../theme';

const CONCERN_LABELS: Record<string, string> = {
  jawline: 'Jawline',
  cheekbones: 'Cheekbones',
  skin: 'Skin',
  hair: 'Hair',
  masculinity: 'Masculinity',
  smile: 'Smile',
  eyes: 'Eyes',
};

function savedPerYear(
  weeklyPkg: ReturnType<typeof packageForPlan>,
  annualPkg: ReturnType<typeof packageForPlan>,
): string | null {
  if (!weeklyPkg || !annualPkg) return null;
  const saved = Math.round(weeklyPkg.product.price * 52 - annualPkg.product.price);
  if (saved <= 0) return null;
  return `Save $${saved}`;
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

  const annualPerWeek = annualPkg ? perWeekLabel(annualPkg) : '$0.96/week';
  const annualTotal = annualPkg ? annualPkg.product.priceString : '$49.99/year';
  const weeklyPrice = weeklyPkg ? weeklyPkg.product.priceString : '$4.99';
  const savings = savedPerYear(weeklyPkg, annualPkg) ?? 'Save $469';

  const topConcern = concerns[0] ?? 'jawline';
  const topConcernLabel = CONCERN_LABELS[topConcern] ?? 'Jawline';
  const visibleChips = concerns.slice(0, 3).map((c) => CONCERN_LABELS[c] ?? c);
  const extraCount = Math.max(0, concerns.length - 3);
  const benefitLabels =
    visibleChips.length > 0 ? visibleChips : ['Full trait scores', 'Personal plan', 'Re-scans'];

  const annualSelected = selectedPlan === 'annual';
  const weeklySelected = selectedPlan === 'weekly';

  return (
    <ScreenShell>
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

        {frontPhoto ? (
          <View style={styles.photoWrap}>
            <View style={styles.photoGlow} pointerEvents="none" />
            <Image source={{ uri: frontPhoto }} style={styles.photo} />
            <View style={styles.photoRing} pointerEvents="none" />
          </View>
        ) : null}

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Analysis complete</Text>
        </View>

        <Text style={styles.title}>Your {topConcernLabel.toLowerCase()} analysis is ready</Text>

        {visibleChips.length > 0 && (
          <View style={styles.chipRow}>
            {visibleChips.map((label) => (
              <View key={label} style={styles.chip}>
                <Text style={styles.chipText}>{label}</Text>
              </View>
            ))}
            {extraCount > 0 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>+{extraCount} more traits</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.unlockLabel}>
          Scored against other men — unlock to see where you stand and the plan for every trait.
        </Text>

        <BlurredTraitGrid concerns={concerns} />

        <View style={styles.benefits}>
          {benefitLabels.map((label) => (
            <View key={label} style={styles.benefitRow}>
              <Text style={styles.benefitCheck}>✓</Text>
              <Text style={styles.benefitText}>{label} plan unlocked</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <Pressable
            onPress={() => setSelectedPlan('annual')}
            accessibilityRole="radio"
            accessibilityState={{ selected: annualSelected }}
            style={styles.planPressable}
          >
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>{savings}</Text>
            </View>
            {annualSelected ? (
              <BronzeMetal
                borderRadius={radii.md}
                contentStyle={styles.planMetalContent}
                ornament
              >
                <View style={styles.planRow}>
                  <View style={styles.annualLeft}>
                    <Text style={styles.annualPriceOnMetal}>{annualPerWeek}</Text>
                    <Text style={styles.annualBilledOnMetal}>
                      billed {annualTotal} once a year
                    </Text>
                    <Text style={styles.bestValue}>Best value</Text>
                  </View>
                  <Text style={styles.planCheckOnMetal}>●</Text>
                </View>
              </BronzeMetal>
            ) : (
              <View style={[styles.planCard, styles.planCardAnnual]}>
                <CelestialOrnament
                  size={40}
                  variant="onSurface"
                  opacity={0.18}
                  style={styles.planOrnament}
                />
                <View style={styles.annualLeft}>
                  <Text style={styles.annualPrice}>{annualPerWeek}</Text>
                  <Text style={styles.annualBilled}>billed {annualTotal} once a year</Text>
                </View>
                <Text style={styles.planCheck}>○</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setSelectedPlan('weekly')}
            accessibilityRole="radio"
            accessibilityState={{ selected: weeklySelected }}
            style={[
              styles.planCard,
              weeklySelected && styles.planCardSelected,
            ]}
          >
            <View style={styles.planInfo}>
              <Text style={[styles.planTitle, weeklySelected && styles.planTitleSelected]}>
                Weekly
              </Text>
            </View>
            <View style={styles.planRight}>
              <Text style={[styles.planPrice, weeklySelected && styles.planPriceSelected]}>
                {weeklyPrice}
              </Text>
              <Text style={[styles.planCheck, weeklySelected && styles.planCheckSelected]}>
                {weeklySelected ? '●' : '○'}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.ctaWrap}>
          <View style={styles.ctaHalo} pointerEvents="none" />
          <PressableScale
            testID="paywall-unlock"
            onPress={() => (plansReady ? subscribe(selectedPlan) : reloadOffering())}
            style={[
              styles.cta,
              (purchasing || (!plansReady && !plansFailed)) && styles.ctaDisabled,
            ]}
            disabled={purchasing || (!plansReady && !plansFailed)}
          >
            <Text style={styles.ctaText}>
              {purchasing
                ? 'Processing…'
                : plansReady
                  ? 'Reveal my scores'
                  : plansFailed
                    ? 'Retry loading plans'
                    : 'Loading plans…'}
            </Text>
          </PressableScale>
        </View>

        {plansFailed ? <Text style={styles.plansError}>{offeringError}</Text> : null}

        <Text style={styles.renewalDisclosure}>
          {selectedPlan === 'annual'
            ? `Renews automatically at ${annualTotal}/year unless cancelled at least 24 hours before the current period ends.`
            : `Renews automatically at ${weeklyPrice}/week unless cancelled at least 24 hours before the current period ends.`}{' '}
          Manage or cancel anytime in your App Store account settings.
        </Text>

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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 52,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  maybeLater: {
    ...typography.label,
    color: colors.textTertiary,
  },
  photoWrap: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.tertiary,
    opacity: 0.14,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.tertiary,
  },
  photoRing: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 1,
    borderColor: 'rgba(239,230,216,0.22)',
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  title: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  unlockLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  benefits: {
    marginTop: spacing.md,
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitCheck: {
    ...typography.label,
    color: colors.secondary,
    fontWeight: '700',
  },
  benefitText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  plans: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  planPressable: {
    position: 'relative',
    overflow: 'visible',
  },
  planMetalContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    overflow: 'hidden',
  },
  planCardAnnual: {
    paddingTop: spacing.xl,
  },
  planCardSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.surface,
  },
  planOrnament: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
  savingsBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    zIndex: 2,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    paddingVertical: 4,
    paddingHorizontal: 11,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onAccent,
  },
  annualLeft: {
    flex: 1,
    gap: 2,
  },
  annualPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  annualPriceOnMetal: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSecondary,
  },
  annualBilled: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  annualBilledOnMetal: {
    ...typography.caption,
    color: colors.onSecondary,
    opacity: 0.75,
  },
  bestValue: {
    ...typography.caption,
    color: colors.onSecondary,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.9,
  },
  planInfo: {
    flex: 1,
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
  planRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  planPriceSelected: {
    color: colors.textPrimary,
  },
  planCheck: {
    fontSize: 18,
    color: colors.border,
  },
  planCheckSelected: {
    color: colors.tertiary,
  },
  planCheckOnMetal: {
    fontSize: 18,
    color: colors.onSecondary,
  },
  ctaWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaHalo: {
    position: 'absolute',
    width: '100%',
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    opacity: 0.28,
    transform: [{ scaleX: 1.04 }, { scaleY: 1.35 }],
  },
  cta: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 15,
    alignItems: 'center',
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
  renewalDisclosure: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 15,
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
