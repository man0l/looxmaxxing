import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AVATAR_PREVIEWS, type AvatarPreview } from '../types/avatars';
import { TRAITS } from '../types/traits';
import { topPercentLabel } from '../services/scoring';
import { useOnboarding } from '../store/OnboardingContext';
import { useScans } from '../store/ScanContext';
import { AvatarRender } from '../components/AvatarRender';
import { BrandMark } from '../components/BrandMark';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { TabSwipeHost } from '../components/TabSwipeHost';
import { useCachedRender } from '../hooks/useCachedRender';
import { useTabRootReset } from '../hooks/useTabRootReset';
import { AvatarPreviewScreen } from './avatars/AvatarPreviewScreen';
import { colors, spacing, typography } from '../theme';

function PreviewCard({ preview, onPress }: { preview: AvatarPreview; onPress: () => void }) {
  const { latest } = useScans();
  const trait = TRAITS.find((t) => t.id === preview.traitId);
  const percentile = latest.scores.find((s) => s.traitId === preview.traitId)?.percentile;
  const cachedUrl = useCachedRender(preview.traitId, preview.styles[0], { anyStyle: true });

  return (
    <Card role="quiet" onPress={onPress} style={styles.card}>
      <AvatarRender traitId={preview.traitId} size={64} imageUrl={cachedUrl} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{preview.headline}</Text>
        <Text style={styles.cardMeta}>
          {trait?.label}
          {percentile != null ? ` · ${topPercentLabel(percentile)} today` : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Card>
  );
}

export function AvatarsScreen() {
  const { concerns } = useOnboarding();
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTraitId, setActiveTraitId] = useState<string | null>(null);
  const [lastFocusTrait, setLastFocusTrait] = useState<string | undefined>(undefined);

  const popNested = useCallback(() => setActiveTraitId(null), []);
  useTabRootReset(popNested);

  const focusTrait = (route.params as { focusTrait?: string } | undefined)?.focusTrait;
  if (focusTrait !== lastFocusTrait) {
    setLastFocusTrait(focusTrait);
    if (focusTrait) setActiveTraitId(focusTrait);
  }
  useEffect(() => {
    if (focusTrait) navigation.setParams({ focusTrait: undefined } as never);
  }, [focusTrait, navigation]);

  const concernSet = new Set(concerns);
  const goals = AVATAR_PREVIEWS.filter((p) => concernSet.has(p.traitId));
  const rest = AVATAR_PREVIEWS.filter((p) => !concernSet.has(p.traitId));

  let body: ReactNode;
  if (activeTraitId) {
    body = (
      <AvatarPreviewScreen
        traitId={activeTraitId}
        onClose={popNested}
        onStartPlan={() => {
          popNested();
          navigation.navigate('Practice' as never);
        }}
      />
    );
  } else {
    body = (
      <ScreenShell>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <BrandMark style={styles.brand} />
          <Text style={styles.header}>Avatars</Text>
          <Text style={styles.sub}>See where your plan can take you — then start it.</Text>

          {goals.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Your goals</Text>
              <View style={styles.group}>
                {goals.map((p) => (
                  <PreviewCard
                    key={p.traitId}
                    preview={p}
                    onPress={() => setActiveTraitId(p.traitId)}
                  />
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>
            {goals.length > 0 ? 'More to explore' : 'Previews'}
          </Text>
          <View style={styles.group}>
            {rest.map((p) => (
              <PreviewCard
                key={p.traitId}
                preview={p}
                onPress={() => setActiveTraitId(p.traitId)}
              />
            ))}
          </View>
        </ScrollView>
      </ScreenShell>
    );
  }

  return (
    <TabSwipeHost isNested={activeTraitId != null} onPopNested={popNested}>
      {body}
    </TabSwipeHost>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  container: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: 110, gap: spacing.sm },
  brand: { marginBottom: spacing.sm },
  header: { ...typography.display, fontSize: 24, color: colors.textPrimary },
  sub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionLabel: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.md },
  group: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardMeta: { ...typography.caption, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textTertiary, paddingRight: spacing.xs },
});
