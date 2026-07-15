import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
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

const STYLE_DEBOUNCE_MS = 300;

function isAbortError(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError';
}

export function AvatarPreviewScreen({ traitId, onClose, onStartPlan }: Props) {
  const preview = getAvatarPreview(traitId);
  const { latest } = useScans();
  const [selected, setSelected] = useState(preview?.styles[0]);
  const [debouncedStyle, setDebouncedStyle] = useState(preview?.styles[0]);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderStyle, setRenderStyle] = useState<string | undefined>(preview?.styles[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const photoUri = latest.photoUri ?? null;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStyle(selected), STYLE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [selected]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await hydrateRenderCache();
      if (cancelled) return;
      const cached = getCachedRender(traitId, selected);
      if (cached) {
        setRenderUrl(cached);
        setRenderStyle(selected);
        setError(null);
        setLoading(false);
      } else {
        setRenderUrl(null);
        setRenderStyle(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [traitId, selected]);

  useEffect(() => {
    const style = debouncedStyle;
    if (!style) return;
    const controller = new AbortController();
    (async () => {
      await hydrateRenderCache();
      if (controller.signal.aborted) return;
      const cached = getCachedRender(traitId, style);
      if (cached) return;
      if (!photoUri) {
        setError('Scan first to preview your potential.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const appUserId = await getAppUserID();
        const r = await submitRender({
          appUserId,
          photoUri,
          traitId,
          style,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        await setCachedRender(traitId, style, r.imageUrl, r.expiresAt);
        setRenderUrl(r.imageUrl);
        setRenderStyle(style);
      } catch (e) {
        if (controller.signal.aborted || isAbortError(e)) return;
        if (__DEV__ && Platform.OS === 'web') {
          const stub = 'https://placehold.co/232x232/3A2A1A/EFE6D8.png?text=Dev+Render';
          await setCachedRender(traitId, style, stub);
          setRenderUrl(stub);
          setRenderStyle(style);
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
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [traitId, debouncedStyle, photoUri, retryNonce]);

  const displayUrl = renderStyle === selected ? renderUrl : null;
  const showLoading = loading || selected !== debouncedStyle;

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
          <View style={styles.renderFrame}>
            <AvatarRender traitId={traitId} style={selected} size={232} imageUrl={displayUrl} />
            {showLoading && (
              <View style={styles.renderOverlay}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.renderOverlayText}>Rendering…</Text>
              </View>
            )}
          </View>
        </View>

        {error && !displayUrl && (
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
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  renderWrap: { marginBottom: spacing.lg, alignItems: 'center' },
  renderFrame: { width: 232, height: 232, position: 'relative' },
  renderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 232,
    height: 232,
    borderRadius: radii.lg,
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
