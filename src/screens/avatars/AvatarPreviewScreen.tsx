import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { getAvatarPreview } from '../../types/avatars';
import { TRAITS } from '../../types/traits';
import { topPercentLabel } from '../../services/scoring';
import { useScans } from '../../store/ScanContext';
import { AvatarRender } from '../../components/AvatarRender';
import { submitRender, ScanApiError } from '../../services/api';
import { getAppUserID } from '../../services/purchases';
import { getCachedRender, hydrateRenderCache, setCachedRender } from '../../services/renderCache';
import { colors, spacing, radii, typography } from '../../theme';

interface Props {
  traitId: string;
  onClose: () => void;
  onStartPlan: () => void;
}

export function AvatarPreviewScreen({ traitId, onClose, onStartPlan }: Props) {
  const preview = getAvatarPreview(traitId);
  const { latest } = useScans();
  const [selected, setSelected] = useState(preview?.styles[0]);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const photoUri = latest.photoUri ?? null;

  useEffect(() => {
    let cancelled = false;
    const style = selected;
    (async () => {
      await hydrateRenderCache();
      if (cancelled) return;
      const cached = getCachedRender(traitId, style);
      if (cached) {
        setRenderUrl(cached);
        setError(null);
        setLoading(false);
        return;
      }
      if (!photoUri) {
        setRenderUrl(null);
        setLoading(false);
        setError('Scan first to preview your potential.');
        return;
      }
      setLoading(true);
      setError(null);
      setRenderUrl(null);
      try {
        const appUserId = await getAppUserID();
        const r = await submitRender({ appUserId, photoUri, traitId, style });
        if (cancelled) return;
        await setCachedRender(traitId, style, r.imageUrl, r.expiresAt);
        setRenderUrl(r.imageUrl);
      } catch (e) {
        if (cancelled) return;
        if (__DEV__) {
          const stub = 'https://placehold.co/232x232/3A2A1A/EFE6D8.png?text=Dev+Render';
          await setCachedRender(traitId, style, stub);
          setRenderUrl(stub);
          setError(null);
          return;
        }
        setError(
          e instanceof ScanApiError && e.status === 429
            ? 'Too many renders — wait a minute and try again.'
            : e instanceof Error
              ? e.message
              : 'Render failed.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [traitId, selected, photoUri, retryNonce]);

  if (!preview) return null;
  const trait = TRAITS.find((t) => t.id === traitId);
  const percentile = latest.scores.find((s) => s.traitId === traitId)?.percentile;

  return (
    <View style={styles.root}>
      <View style={styles.headerBar}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.back}>‹ Avatars</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.kicker}>{trait?.label}</Text>
        <Text style={styles.title}>{preview.headline}</Text>
        <Text style={styles.blurb}>{preview.blurb}</Text>

        <View style={styles.renderWrap}>
          {renderUrl ? (
            <Image source={{ uri: renderUrl }} style={styles.renderImg} resizeMode="cover" />
          ) : (
            <View>
              <AvatarRender traitId={traitId} style={selected} size={232} />
              {loading && (
                <View style={styles.renderOverlay}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.renderOverlayText}>Rendering…</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {error && !renderUrl && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            {photoUri && (
              <Pressable style={styles.retryBtn} onPress={() => setRetryNonce((n) => n + 1)}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.pillRow}>
          {preview.styles.map((s) => {
            const active = s === selected;
            return (
              <Pressable
                key={s}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelected(s)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          A styling preview — not a predicted result. Your plan moves your score over time.
        </Text>

        {percentile != null && (
          <Text style={styles.today}>Today: {topPercentLabel(percentile)} of men</Text>
        )}

        <Pressable style={styles.cta} onPress={onStartPlan}>
          <Text style={styles.ctaText}>Start {preview.plan} ›</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerBar: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  back: { ...typography.label, color: colors.primary },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40, alignItems: 'center' },
  kicker: { ...typography.caption, color: colors.secondary, alignSelf: 'flex-start' },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  blurb: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  renderWrap: { marginBottom: spacing.lg, alignItems: 'center' },
  renderImg: {
    width: 232,
    height: 232,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  renderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,6,4,0.5)',
  },
  renderOverlayText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  errorBox: { alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  errorText: { ...typography.bodySm, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryText: { color: colors.onPrimary, fontWeight: '600' },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pillActive: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  pillText: { ...typography.label, color: colors.textSecondary },
  pillTextActive: { color: colors.onTertiary },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  today: { ...typography.label, color: colors.tertiary, marginTop: spacing.md },
  cta: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: { ...typography.h3, color: colors.primary },
});
