import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AVATAR_PREVIEWS, type AvatarPreview } from '../types/avatars';
import { TRAITS } from '../types/traits';
import { topPercentLabel } from '../services/scoring';
import { useOnboarding } from '../store/OnboardingContext';
import { useScans } from '../store/ScanContext';
import { AvatarRender } from '../components/AvatarRender';
import { AvatarPreviewScreen } from './avatars/AvatarPreviewScreen';
import { colors, spacing, radii, typography } from '../theme';

function PreviewCard({ preview, onPress }: { preview: AvatarPreview; onPress: () => void }) {
  const { latest } = useScans();
  const trait = TRAITS.find((t) => t.id === preview.traitId);
  const percentile = latest.scores.find((s) => s.traitId === preview.traitId)?.percentile;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <AvatarRender traitId={preview.traitId} size={64} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{preview.headline}</Text>
        <Text style={styles.cardMeta}>
          {trait?.label}
          {percentile != null ? ` · ${topPercentLabel(percentile)} today` : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function AvatarsScreen() {
  const { concerns } = useOnboarding();
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTraitId, setActiveTraitId] = useState<string | null>(null);
  const [lastFocusTrait, setLastFocusTrait] = useState<string | undefined>(undefined);

  const focusTrait = (route.params as { focusTrait?: string } | undefined)?.focusTrait;
  if (focusTrait !== lastFocusTrait) {
    setLastFocusTrait(focusTrait);
    if (focusTrait) setActiveTraitId(focusTrait);
  }
  useEffect(() => {
    if (focusTrait) navigation.setParams({ focusTrait: undefined } as never);
  }, [focusTrait, navigation]);

  if (activeTraitId) {
    return (
      <AvatarPreviewScreen
        traitId={activeTraitId}
        onClose={() => setActiveTraitId(null)}
        onStartPlan={() => {
          setActiveTraitId(null);
          navigation.navigate('Practice' as never);
        }}
      />
    );
  }

  const concernSet = new Set(concerns);
  const goals = AVATAR_PREVIEWS.filter((p) => concernSet.has(p.traitId));
  const rest = AVATAR_PREVIEWS.filter((p) => !concernSet.has(p.traitId));

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Preview your potential</Text>
        <Text style={styles.sub}>See where your plan can take you — then start it.</Text>

        {goals.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Your goals</Text>
            <View style={styles.group}>
              {goals.map((p) => (
                <PreviewCard key={p.traitId} preview={p} onPress={() => setActiveTraitId(p.traitId)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>
          {goals.length > 0 ? 'More to explore' : 'Previews'}
        </Text>
        <View style={styles.group}>
          {rest.map((p) => (
            <PreviewCard key={p.traitId} preview={p} onPress={() => setActiveTraitId(p.traitId)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: 110, gap: spacing.sm },
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardMeta: { ...typography.caption, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textTertiary, paddingRight: spacing.xs },
});
