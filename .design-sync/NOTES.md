# design-sync notes — LooxMaxxing (Celestial Ember)

- This is an Expo app, not a packaged DS. There is no repo build for a library; `cfg.buildCmd` (`node .design-sync/build-dist.mjs`) creates `dist/` on demand: esbuild bundles `.design-sync/ds-entry.ts` with `alias: react-native → react-native-web` and Metro-style web-first `resolveExtensions` (`.web.tsx` first — this is what keeps native-only `services/share.ts` out of the bundle in favor of `share.web.ts`), then `tsc -p .design-sync/tsconfig.dist.json` emits declarations to `dist/types/`.
- `package.json` gained `"types": "dist/types/.design-sync/ds-entry.d.ts"` — required: the converter's component discovery reads the `.d.ts` entry from that field; without it, `[ZERO_MATCH]`. Harmless to the app.
- `.design-sync/ds-entry.ts` is the DS surface: 35 components + theme tokens + data helpers (`getScores`, `buildHeatmap`, `seedHistory`, `TRAITS`…) + `ToastProvider`/`SafeAreaProvider`. New components must be added there to sync.
- `.design-sync/node_modules` symlink → `../.ds-sync/node_modules` (build-dist.mjs imports esbuild through it). Recreate per clone: `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`.
- `cfg.provider` = SafeAreaProvider → ToastProvider (Toast needs insets; ShareSheet needs toast context). Both are exported from the entry so the provider check passes.
- Icons require `color` (no default) — the reason all icon previews are authored; an unauthored icon card renders invisible strokes.
- **Toast preview tricks** (in `.design-sync/previews/Toast.tsx`): (1) `window.setTimeout` patched to drop timers ≥3000ms — Toast auto-dismisses at 3.5–5s; (2) scoped CSS `opacity:1/transform:none !important` — capture screenshots land before the entrance spring finishes. Both needed; without them the sheet captures an empty stage.
- Fonts: everything is `fontFamily: 'System'` → system-ui stack on web. No font files to ship; no `[FONT_MISSING]`.
- `[CSS_RUNTIME]` is expected — react-native-web injects styles at runtime; `styles.css` is the self-styling stub.
- `guidelinesGlob` narrowed to DESIGN.md + PRD.md (default glob swept in CICD/REVENUECAT/SHARING infra docs — noise for the design agent).
- Playwright: repo pins 1.61.1 → chromium(-headless-shell) build 1228; installed via `npx playwright install chromium` on 2026-07-03.
- Faithful-install step skipped on first sync: node_modules was present and healthy from active app development (`npm ci` would have cost minutes for no change).

## Known render warns

_None — final validate run: 35/35 clean, 0 bad, 0 thin, 0 variantsIdentical, 0 floor cards._

## Re-sync risks

- `dist/` is generated and gitignored — always run `cfg.buildCmd` before the converter on a fresh clone or after `src/` changes.
- The DS surface is hand-enumerated in `ds-entry.ts`; a new component in `src/components/` does NOT sync until added there (and its preview authored — icons especially).
- `ScoreShareCard` preview hardcodes trait rows (labels + percentiles). If the trait taxonomy changes, update `.design-sync/previews/ScoreShareCard.tsx` too.
- The Toast timer patch assumes dismiss timers are ≥3000ms; if `DURATION` shrinks below that, the patch stops suppressing dismissal.
- `seedHistory()`/`buildHeatmap()` previews depend on today's date — heatmap pixels differ day to day (render hash covers structure, not pixels; not a grade-invalidation risk, but screenshots won't be byte-identical across days).
- react-native-web 0.21 emits a `useNativeDriver` console warning in every preview — harmless, expected.
