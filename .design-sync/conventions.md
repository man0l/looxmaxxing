# Celestial Ember — build conventions

This library is a React Native app's design system compiled for the web via react-native-web. Components style themselves internally — **there are no CSS classes to use**. Style your own layout glue with inline `style` objects on plain `div`s, using the exported JS tokens.

## Tokens (JS exports, not CSS variables)

Import from the library: `colors`, `typography`, `spacing`, `radii`, `components`.

- `colors.background` `#15100B` — app background. **Every screen sits on this dark warm ground; never pure black, never white.**
- `colors.surface` `#241B12` (card) / `colors.surfaceRaised` `#2E2418` / `colors.surfaceInset` `#1A140D` — three tonal steps; depth comes from these + 1px `colors.border` `#3A2F21` borders. **No box shadows.**
- `colors.primary` `#3D6BE6` — interaction only. If it's blue, it must be tappable.
- `colors.secondary` `#C99E6F` (bronze) — monetization/premium only, max one per screen.
- `colors.tertiary` `#EFE6D8` (cream) — data ink and selected states.
- `colors.accent` `#F25430` (ember) — urgency badges only, never large areas.
- `colors.textPrimary` `#FFFFFF` / `textSecondary` `#9A9285` / `textTertiary` `#6E6657`.
- `radii`: cards 22px, inputs 16px, badges 10px, pills fully round.
- Font is the system stack (SF Pro Rounded on iOS); weights 400 + 600/700 only.

## Providers

- `ShareSheet` reads toast context — wrap it (or the app) in `<ToastProvider>`.
- `Toast` reads safe-area insets — wrap in `<SafeAreaProvider>`.
- Everything else needs no provider.

## Component rules

- Icons (`ResultsIcon`, `JawlineGlyph`, `InstagramIcon`, …) require an explicit `color` prop — they render invisible without it. Use token colors.
- Scores are percentile-framed: `RingGauge percentile={61}` shows the ring; pair with copy like "Top 39% of men" (`topPercentLabel`) — never verdict/shame language.
- Data helpers ship in the bundle: `getScores()`, `TRAITS`, `topPercentLabel()`, `scoreLabel()`, `buildHeatmap(history, todayCount, weeks)`, `seedHistory()` — use them for realistic content instead of inventing shapes.
- `Toast` auto-dismisses after 3.5–5s and animates in; it is absolutely positioned — give its parent `position: relative`.
- `ShareSheet` is a full-screen bottom sheet (absolute inset 0) — render it inside a screen-sized relative container.

## Idiomatic example

```tsx
import { TraitGrid, getScores, colors } from 'looxmaxxing';

<div style={{ background: colors.background, padding: 20, borderRadius: 22, maxWidth: 400 }}>
  <TraitGrid concerns={['jawline', 'skin']} scores={getScores()} onOpenPlan={(traitId) => {}} />
</div>
```

## Where the truth lives

- `guidelines/docs/DESIGN.md` — the full Celestial Ember spec (read before styling anything).
- `guidelines/docs/PRD.md` — product rules: percentile framing, hard paywall, locked trait→plan mapping, no community/notification features.
- Per-component `.prompt.md` + `.d.ts` — the API contract and usage.
