# LooxMaxxing — Agent Instructions

## What is this app?

LooxMaxxing is an **AI face rating & self-improvement app** for iOS. Users take guided front + profile selfies, receive an AI-powered percentile score across facial traits (jawline, skin, hair, eyes, smile, masculinity, cheekbones), and get a personalized improvement plan of workouts and daily routines. The app uses a **hard paywall** — the scan results are gated behind a subscription. Retention is driven by streaks, re-scan milestones, and social share cards.

### Core business model

- Hard paywall after capture: blurred results with one personalized tease ("Your jawline analysis is ready")
- Weekly + annual subscription; annual pre-selected; no free trial in v1
- Zero push notifications / email — re-engagement is in-product (streaks, countdowns) and via user-shared cards

### Core loop

> Scan (paid) → personalized plan → daily routine check-ins → streak grows → share card → re-scan at day 14 → score moves → renew

### Information Architecture — 5 fixed tabs

| Tab | Purpose |
|---|---|
| Results | Latest scan, trait grid, re-scan countdown, score timelines |
| Practice | Workouts + daily routines mapped 1:1 to scored traits |
| Avatars | "Preview your potential" outcome visualization linked to traits |
| Ratings | Personal rating history, before/after comparisons. No community feed. |
| Profile | Streak graph, share cards, methodology, subscription, settings |

Photo capture is a **floating action button** on Results and Ratings tabs.

### Trait taxonomy (locked mapping)

Every scored trait maps to exactly one workout/routine:

- Jawline → Jawline workout
- Face/Cheekbones → Cheekbones workout
- Masculinity → Posture workout
- Smile → Smile workout
- Skin → Skin routine
- Hair → Hair routine
- Eyes → Eyes routine

No scored trait dead-ends. No workout without a score feeding it.

## Shipping priorities

- **P0 (MVP, Weeks 1-6):** Onboarding, guided capture, scoring + Results grid, hard paywall + subscription, 5-tab nav, Profile + methodology screen
- **P1 (Retention, Weeks 7-12):** Routines as daily checklists, workouts with tutorials, streak system + heatmap, re-scan + Ratings history + before/after + score timelines
- **P2 (Growth, Weeks 13-18):** Share cards (streak + progress delta), Avatars "preview your potential", Paywall A/B

## Agent behavior rules

1. **Always read `docs/PRD.md` and `docs/DESIGN.md` before making UI/UX decisions.** These are the source of truth.
2. **Design system is "Celestial Ember"** — warm candlelit dark UI. Follow every color, spacing, radius, and typography spec from `docs/DESIGN.md` exactly.
3. **Never introduce features excluded in the PRD** (§6): no community feed, no push notifications, no free scan tier.
4. **Respect guardrails** (§2): age gate 17+, concerns are user-selected (never asserted), percentile framing only, no shame/verdict copy.
5. **Trait-workout mapping is locked** — never create a workout that isn't fed by a scored trait, and never show a trait without its mapped plan.
6. **TypeScript only.** This is a TypeScript project. No `.js` files.
7. **Use Expo APIs** where possible before reaching for third-party packages. Check `https://docs.expo.dev/versions/v56.0.0/` for current API availability.
8. **When building screens**, follow the screen-by-screen spec in PRD §7 (S1-S10).
9. **Component naming**: match the design system component names from `docs/DESIGN.md` (card, banner-premium, pill-segment, badge-urgency, etc.).
10. **Test on iOS first.** This is an iOS-first app.

## Project structure

```
looxmaxxing/
├── docs/
│   ├── PRD.md          # Product Requirements Document
│   └── DESIGN.md       # Design system "Celestial Ember"
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components (Onboarding, Results, Practice, etc.)
│   ├── navigation/     # Tab navigator, screen config
│   ├── theme/          # Design tokens, colors, typography, spacing
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API calls, subscription logic
│   ├── store/          # State management
│   └── types/          # TypeScript type definitions
├── assets/             # Images, fonts, Lottie files
├── App.tsx             # Entry point
└── package.json
```

## Key technical decisions

- **Navigation:** Expo Router (file-based routing) or React Navigation — whichever is more appropriate for the 5-tab fixed structure
- **State management:** Start with React Context + useReducer; upgrade to Zustand only if needed
- **Camera:** expo-camera for guided two-angle capture with alignment overlay
- **Payments:** expo-in-app-purchases or RevenueCat for subscription management
- **Animations:** react-native-reanimated + Lottie for scan-motif animation
- **Charts:** react-native-svg for ring gauges and streak heatmap

## Architecture — local-first

The app is **local-first**: the phone is the source of truth for everything except the two AI capabilities and purchases. Only **three** things touch the network — AI scan scoring, avatar render, and RevenueCat. Everything else works offline.

**On device (source of truth, offline-capable):**
- Scan **results** (percentiles), scan history, captured photos, streak check-ins, practice completions, concerns, settings.
- All derived views are pure functions over local data and need no server: re-scan 14-day gating (local timestamps), deltas, score timelines, before/after comparison, ratings history.
- Persistence target: AsyncStorage / SQLite / MMKV behind the existing store interfaces (`ScanContext`, `StreakContext`, `PracticeContext`, `OnboardingContext`) — swap the seeded mocks for real on-device storage without changing consumers.
- Fits the PRD: no community feed / social graph (§6); face-data privacy + delete-my-photos (§2, §5.6) stays a purely local action.

**Backend API (stateless, transient — the only data network calls):**
- **Scan scoring** — `POST front+profile photos → per-trait percentiles`. Replaces `MOCK_PERCENTILES` in `services/scoring.ts`. The app stores returned scores locally; photos are not needed server-side afterward.
- **Avatar render** — `POST trait+style → image`, cached on device (PRD open-question #4).
- **Photo retention = ephemeral.** The scoring backend processes and **discards** photos (no server-side retention), so the privacy label is "face data uploaded transiently for scoring, not retained."

**Purchases — RevenueCat:**
- Entitlements, restore, and the paywall are RevenueCat's responsibility (`services/purchases.ts` + `SubscriptionContext`). It caches the `Looksmaxxing Pro` entitlement locally and syncs with Apple/RevenueCat servers — read offline, validate online.

**Identity & gating (no accounts/login — consistent with the hard-paywall funnel):**
- Use the RevenueCat **app user ID** as the anonymous identity for backend calls.
- The scan-scoring endpoint must do a **server-side entitlement check** (RevenueCat REST API / webhooks) before scoring — the client gate alone can't protect a paid core endpoint from direct calls.

See **Mock surfaces & what each needs to go live** (below the tracker) for the current stand-ins and the migration path.

---

## Progress Tracker

Update this section after every work session. Move items from TODO → IN PROGRESS → DONE. Add blockers inline.

### P0 — MVP (Weeks 1-6)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Theme setup (`src/theme/` with all Celestial Ember tokens) | DONE | Colors, typography, spacing, radii, component defaults exported |
| 2 | Project scaffold (`src/` folder structure) | DONE | components, screens, navigation, theme, hooks, services, store, types |
| 3 | 5-tab navigation (Results, Practice, Avatars, Ratings, Profile) + floating capture FAB | DONE | Per PRD §3: five fixed tabs with monoline SVG glyphs (`NavIcons.tsx`), active white / inactive text-secondary. Capture is a 56px blue floating action button (`CaptureFab.tsx`) on Results + Ratings only — not a tab. Celestial Ember dark nav |
| 4 | Onboarding — age gate (17+) | DONE | Pill-style age range selector, under-17 exit path, Celestial Ember tokens |
| 5 | Onboarding — welcome & promise screen | DONE | Animated monoline scan hero SVG (reanimated), one-sentence promise, CTA |
| 6 | Onboarding — concern selection (multi-select max 3) | DONE | 2-column grid cards, toggle with cream active state, counter |
| 7 | Onboarding — one depth question on top concern | DONE | Concern tag, 3 pill options, skip link |
| 8 | Onboarding — expectation framing (percentile model) | DONE | Distribution bar chart (SVG), cream/range highlight, tip text |
| 9 | Guided two-angle capture (front + profile, alignment overlay, lighting check) | DONE | Do/don't example cards (square, uncropped), instruction video loop above viewport (expo-video), dashed alignment oval with monoline silhouette, monoline control icons, angle toggle, lighting chip, privacy line. Front→profile flow in OnboardingNavigator |
| 10 | Hard paywall (blurred results, personalized tease, weekly/annual) | DONE | PaywallScreen after capture: blurred ring-gauge grid (concerns large/first), tease from top concern, benefits mirror selected concerns, annual pre-selected w/ bronze Best value + per-week framing, restore link, billing terms. "Maybe later" → locked Results (blurred grid + bronze re-ask banner reopens paywall). Placeholder prices pending PRD open question 1. Purchase is stubbed until item 15 (IAP) |
| 11 | Results grid (ring gauges, percentile framing, concern-first ordering) | DONE | `TraitGrid.tsx`: single `RingGauge` at two sizes, concerns large/first + rest in small grid. Percentile primary ("Top 39% of men"), 0–10 score secondary in ring center, no verdict colors. One CTA per featured card → mapped plan (navigates to Practice tab). |
| 12 | Results — re-scan countdown card | DONE | "Re-rate in 14 days" card at bottom of Results; `getDaysUntilRescan()` in `services/progress.ts` (placeholder until re-scan flow item 21). |
| 13 | Results — streak state banner ("Day 12 — 2 tasks left today") | DONE | Above-the-fold banner "Day 1 · N tasks left today ›" → Practice; `getStreak()` in `services/progress.ts` (placeholder until streak system item 19). |
| 14 | Profile basics (methodology screen, settings, privacy controls) | DONE | Profile hub with Subscription (status, Customer Center [native], restore), About → "How scoring works" methodology screen (`MethodologyScreen.tsx`, 4 trust cards per §5.6), Privacy → delete-my-photos (in-app confirm overlay + `CLEAR_PHOTOS` action; `Alert` avoided since it doesn't render on web) + privacy-policy row. Streak heatmap + share cards deferred to P1/P2 (items 19/25/26). |
| 15 | Subscription infra (Apple IAP integration) | IN PROGRESS | RevenueCat SDK (`react-native-purchases` + `-ui`) wired via platform-split service (`purchases.ts` native / `purchases.web.ts` stub). Entitlement `Looksmaxxing Pro`; products weekly/monthly/yearly/lifetime. SubscriptionContext configures on mount, hydrates from entitlement, listens for updates. Custom paywall reads live `priceString`; Profile has Customer Center + restore. RevenueCat Paywall + Customer Center helpers ready (P2 A/B). See `docs/REVENUECAT.md`. **Remaining: RevenueCat dashboard + App Store Connect product setup, swap test key → prod `appl_` key, device/sandbox purchase test, EAS dev build (native module not in Expo Go).** |

### P1 — Retention (Weeks 7-12)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 16 | Workouts with tutorials (jawline, cheekbones, posture, smile) | DONE | `WorkoutDetailScreen.tsx`: numbered step tutorial (name/detail/duration) + "Mark session complete" toggle. Content in `types/practice.ts`. |
| 17 | Routines as daily AM/PM checklists (skin, hair, eyes) | DONE | `RoutineDetailScreen.tsx`: Morning/Evening checkable task rows, "X of Y done today" progress. Completions in `PracticeContext`. |
| 18 | Practice — "Your plan" pinned section from concern selection | DONE | `PracticeScreen.tsx` hub: "Your plan" pinned from concerns, "More to explore" with full taxonomy. Each card = monoline glyph + type + "Targets Top X%" + today's status. Routes to detail overlays. |
| 19 | Streak system + contribution heatmap (GitHub-style) | DONE | `StreakContext` (consumes Onboarding+Practice for live today count; seeded mock history) + `services/streak.ts` (streak math, milestones 7/14/30/90, heatmap grid) + `StreakHeatmap.tsx` (GitHub-style, cream intensity). Profile shows Day/Longest/milestone/heatmap. Results banner now LIVE ("Day N · X left today" → "all done today ✓"), placeholder removed. Real date-rollover/persistence is backend. |
| 20 | Streak freeze (one per month mercy token) | DONE | Modeled in `StreakContext` (`freezeAvailable`/`useFreeze`), shown on Profile streak card. Auto-apply-on-break needs date rollover (backend). |
| 21 | Re-scan flow (14-day cooldown) | DONE | New `ScanContext` (scan-history store; seeds 1 scan 16 days ago so cooldown is elapsed) + `types/scan.ts` + `improveScores()`. Results re-scan card is live: "Re-rate in N days" or actionable "Re-rate now ›" when cooldown elapsed → reuses `GuidedCaptureScreen` (stepLabel "New scan") → appends an improved scan → grid + share read latest scan → cooldown resets. `progress.ts` deleted. **Store underpins items 22–24.** |
| 22 | Ratings history (chronological scan list) | DONE | `RatingsScreen.tsx`: chronological list (newest first) from `ScanContext`, each row = overall-score ring + date + "Top X% of men" + "Latest" badge + per-entry Share → that scan's ScoreShareCard (§5.5). Re-scan FAB wired via shared `useRescanFlow` hook (also refactored into Results). Fills the previously-empty Ratings tab. |
| 23 | Before/after comparison (side-by-side + per-trait deltas) | DONE | New `src/screens/ratings/ComparisonScreen.tsx` (overall before/after RingGauges + delta, per-trait score/score/delta rows for all 7 traits) + `deltaLabel()` in `services/scoring.ts`. `RatingsScreen` gained a "Compare" toggle (only shown when ≥2 scans): tap two rows to select (radio-style checkbox, primary-border highlight) and it auto-opens the comparison overlay, sorted older→newer. No photos are stored yet (mock scoring only), so the comparison is score-based, not photo side-by-side — flagged as a gap vs PRD §5.5's "side-by-side photos" wording. tsc + lint clean; verified web bundle builds/serves. |
| 24 | Score timelines (after ≥ 2 scans) | DONE | New `TraitDetailScreen.tsx` (the previously-missing trait-detail surface: gauge + percentile + breakdown + timeline + single plan CTA per §5.1) and `ScoreTimeline.tsx` (react-native-svg line chart over all scans for one trait; renders only when ≥2 scans, else an empty hint). Tapping a trait in `TraitGrid` now opens detail (overlay-state in Results) instead of jumping straight to Practice; detail CTA routes to the mapped plan. |

### P2 — Growth (Weeks 13-18)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 25 | Share cards — streak/commitment card (heatmap + streak count) | DONE (UI) | `ShareCards.tsx` StreakShareCard + `ShareSheet.tsx` (icon row Stories/X/WhatsApp/TikTok + More) wired to Streak screen. UI verified on web. Native capture + social deep links are device-only (see `docs/SHARING.md`); needs FB App ID + Info.plist schemes. |
| 26 | Share cards — per-scan score card (exact ratings, no deltas) | DONE (UI) | ScoreShareCard (exact per-trait percentiles + overall, no deltas) behind Results "Share". Same share sheet/strategy. UI verified on web; native device-only. Score-card Share also belongs on each Ratings entry (item 22). |
| 27 | Avatars — "Preview your potential" trait-linked renders | DONE | `AvatarsScreen` rebuilt from placeholder into the "Preview your potential" gallery (concern-first "Your goals" + "More to explore"), `AvatarPreviewScreen` (large render + selectable style pills + "styling preview, not a predicted result" disclaimer per §9 risk + today's percentile + "Start <plan> ›" CTA → Practice). New `types/avatars.ts` (per-trait headline/styles/plan), `components/AvatarRender.tsx` (one consistent placeholder render: warm gradient + silhouette + trait glyph). Trait-linked entry points per §5.4: Results "See your potential" card → Avatars tab; TraitDetail "Preview your potential ›" → deep-links to that trait's preview via `focusTrait` route param. Renders are styled placeholders (no AI backend — same mock stance as scores). |
| 28 | Paywall A/B program (annual framing, trial test, avatar-credit tier) | TODO | |

### Blockers

_None yet._

### Mock surfaces & what each needs to go live

Everything user-facing works end-to-end, but **nothing is persisted or server-backed yet**. There is no scoring AI, no render AI, and no real scan/streak/purchase persistence. The mocked surfaces:

| # | Surface | Where | What it fakes | What it needs to go live |
|---|---------|-------|---------------|--------------------------|
| 1 | **AI face scoring** | `services/scoring.ts` | `MOCK_PERCENTILES` (fixed per-trait percentiles); `improveScores()` fakes re-scan gains | Real scoring model/service: upload front+profile photos → per-trait percentiles. The app's core value — this is the priority backend. |
| 2 | **Scan history / persistence** | `store/ScanContext.tsx` (`seedScans()`) | Fabricates 3 scans (44/30/16 days ago) so history/deltas/compare are populated | Persisted scan store (local + server) writing real captures and scores; true 14-day re-scan gating from real timestamps |
| 3 | **Streak history** | `store/StreakContext.tsx` + `services/streak.ts` (`seedHistory()`) | Streak math is real, but the history it runs on is generated | Real check-in persistence + date rollover; auto-apply streak-freeze on a real broken streak |
| 4 | **Avatar renders** | `components/AvatarRender.tsx` | Styled SVG silhouette placeholder; style pills don't change the image | A render provider (PRD open-question #4) generating per-trait/per-style images; render-credit metering for the annual upsell |

Real services (not mocked) but not yet live / web-stubbed:

| Service | Status |
|---------|--------|
| `services/purchases.ts` (RevenueCat) | Real SDK, **not live** — needs dashboard + App Store Connect products, prod `appl_` key, sandbox test, EAS dev build (tracker item #15). `purchases.web.ts` is a web stub. |
| `services/share.ts` (view-shot + react-native-share) | Real, **device-only** — needs FB App ID + Info.plist schemes (`docs/SHARING.md`). `share.web.ts` stubs to `navigator.share` for web verification. |

### Changelog

- **Session 20 (2026-07-15):** Design Phase 1 foundation. `ScreenShell` gradient on all tab roots + Methodology + Paywall + onboarding; Nunito Sans via `@expo-google-fonts/nunito-sans` wired through `typography` tokens; role-based `Card` (`quiet`/`hero`/`inset`/`premium`) + `BannerPremium` + `CelestialOrnament`; `PressableScale` (reduce-motion aware) on cards/FAB/primary CTAs; Capture FAB soft blue halo (hard black shadow removed). Branch `feat/design-phase-1-foundation`. tsc + lint clean; web welcome smoke OK. Phase 2 (animated rings / Results composition) still open.
- **Session 19 (2026-07-02):** Play Store offerings fix + visible plan-load errors. Diagnosed "Loading plans…" on the Android release build via adb logcat: first the Test Store API key had shipped in a release build (RC SDK crash), then after the `goog_` key was set, RC returned `ConfigurationError: no Play Store products registered for your offerings` — the current offering's packages only had Test Store products attached. Fixed in the RevenueCat dashboard (attached `yearly:default`/`weekly:default` Play products to the offering packages — server-side, no rebuild). Fresh launch on device shows no RC errors. Because that failure was silent in-app, offerings errors are now surfaced: `getCurrentOffering()` returns `{ offering, error }` (both `purchases.ts` and `purchases.web.ts`), `SubscriptionContext` gained `offeringError` + `reloadOffering()` and toasts the error, and PaywallScreen shows the error message + an enabled "Retry loading plans" CTA instead of a permanently disabled "Loading plans…". tsc + lint clean. On-device paywall visual check still pending (device keyguard blocked remote screencap).
- **Session 18 (2026-06-30):** Live ambient lighting chip (capture screen). Added `expo-sensors@~56.0.6` + plugin; new `useLightingOk(active)` hook (LightSensor lux≥30 on Android, CameraBrightness EV poll on iOS via pre-existing native module). Wired live into `GuidedCaptureScreen` (replaced static `lightingOk` prop + callers in OnboardingNavigator/Results/Ratings). Shows "✓ Lighting looks good" or "✕ Too dark — find brighter light" only when reading available; no chip on null. Android prebuild+debug build succeeded; `LightSensorModule` present. PR #20. Device verification pending (no device attached).
- **Session 17 (2026-06-22):** Avatars "Preview your potential" (PRD §5.4 — item 27, opens P2 Growth). Rebuilt the placeholder `AvatarsScreen` into a trait-linked gallery: concern-first "Your goals" + "More to explore", each card a consistent placeholder render (`components/AvatarRender.tsx` — warm gradient + head silhouette + trait glyph badge) + headline + "Top X% today". New `screens/avatars/AvatarPreviewScreen.tsx` (large render, selectable style pills that swap the render's style chip, a "styling preview — not a predicted result" disclaimer per the §9 overpromise risk, today's percentile, and "Start <plan> ›" CTA into the mapped Practice plan). New `types/avatars.ts` (per-trait headline/blurb/styles, plan from TRAITS). Trait-linked entry points beyond the tab (§5.4): Results gained a "See your potential" card → Avatars tab; `TraitDetailScreen` gained a "Preview your potential ›" link that deep-links straight to that trait's preview via an `Avatars` `focusTrait` route param (consumed + cleared in a `useEffect`). Verified full flow in browser (375×812): gallery concern ordering, preview pills swap, CTA → Practice, Results entry, and the trait-detail deep-link landing on the right preview. tsc clean, 0 console errors. NOTE: renders are styled placeholders — real AI render provider/credits is backend + PRD open-question 4.
- **Session 16 (2026-06-22):** Score timelines (PRD §5.1 — item 24, last P1 TODO). Built the trait-detail surface that should have existed since the Results work: new `src/screens/TraitDetailScreen.tsx` (latest gauge + "Top X% of men" + a Score/Percentile/Scans breakdown card + the timeline + a single "Open <plan> ›" CTA into the mapped workout/routine) and `src/components/ScoreTimeline.tsx` (responsive react-native-svg line chart, onLayout-width, cream data ink, last point emphasized, axis = first→last scan date with a "5.5 → 6.1"/"Holding steady" delta; renders an empty-hint card when <2 scans per the PRD gate). Rewired `TraitGrid.onOpenPlan` consumer in `ResultsScreen` to open the trait detail (overlay-state, same pattern as Streak) instead of jumping straight to Practice; the detail's CTA performs the Practice navigation. Data came free from `ScanContext.scans` (newest-first, reversed for the chart). tsc clean for all new files (the only tsc/lint errors are pre-existing `expo-camera`/`expo-image-picker` missing-module errors in `GuidedCaptureScreen.tsx`, unrelated). **P1 Retention release is now feature-complete (items 16–24 DONE).** NOTE: timeline uses seeded mock scan history like the rest of the app; real persistence is backend.
- **Session 1 (2026-06-12):** Initialized Expo project (blank-typescript), copied PRD + DESIGN into `docs/`, scaffolded `src/` structure, wrote AGENTS.md and CLAUDE.md with full app context.
- **Session 2 (2026-06-12):** Theme tokens (colors, typography, spacing, radii, components). 5-tab navigation with custom tab bar + center raised capture FAB. Placeholder screens for all 5 tabs. TypeScript passes clean.
- **Session 3 (2026-06-12):** Full onboarding flow — AgeGate, Welcome (animated scan hero), ConcernSelection, DepthQuestion, Expectations (SVG bar chart), GuidedCapture (do/don't examples, alignment oval, front→profile). OnboardingContext with useReducer. TypeScript passes clean.
- **Session 4 (2026-06-12):** Onboarding visual audit via expo web + Playwright against PRD/DESIGN. Fixed: capture do/don't examples were cover-cropped to 90px strips cutting off the jawline (now full square via aspect-ratio wrapper); added missing instruction video loop `onboarding-for-selfie-taking-asset.mp4` above the capture viewport (expo-video, muted/looped); replaced all emoji (concern cards, depth tag, capture controls, alignment silhouette) with monoline SVG glyphs in `src/components/icons/OnboardingIcons.tsx`; removed Welcome hero's muddying 35% overlay and the unverifiable "4.8 on the App Store" badge (PRD §4.1/S1). Lint + tsc clean. Logged TabNavigator/PRD §3 mismatch as blocker.
- **Session 15 (2026-06-14):** Ratings history (PRD §5.5 — item 22). Extracted `src/hooks/useRescanFlow.ts` (shared re-scan capture flow) and refactored Results to use it. Rebuilt `RatingsScreen.tsx` (was a placeholder): chronological scan list from `ScanContext` newest-first, each row = RingGauge(overall) + formatted date + "Top X% of men" + "Latest" badge on newest + per-entry Share opening that scan's ScoreShareCard. Re-scan FAB wired. Verified in browser: after a re-scan, both scans listed (Jun 14 6.1/Top 39% Latest, May 29 5.5/Top 45%); the May entry's Share showed its own original ratings (5.5), distinct from the latest. tsc + lint clean. Ratings tab is no longer empty. Remaining P1: before/after (#23) + score timelines (#24), both reachable from this list.
- **Session 14 (2026-06-14):** Re-scan flow (PRD §5.1 — item 21, opens the P1 Ratings cluster). New `src/types/scan.ts`, `src/store/ScanContext.tsx` (scan-history store; seeds one scan 16 days ago so the cooldown is already elapsed → demoable; exposes latest/canRescan/daysUntilRescan/rescan), `improveScores()` in scoring. `GuidedCaptureScreen` parameterized (`stepLabel` prop) and reused for re-capture. Results now reads the **latest scan's** scores (TraitGrid + share card take a `scores` prop) instead of the static mock; re-scan card toggles "Re-rate in N days" ↔ actionable "Re-rate now ›"; CaptureFab triggers re-scan when available; "✓ New scan saved" confirmation. Deleted unused `services/progress.ts`. Verified in browser: cooldown-elapsed state → re-capture (front+profile) → every score improved (e.g. Jawline Top 39%→35%) → cooldown reset to 14 days. tsc + lint clean. NOTE: scan history is seeded mock (like scores/streak); real persistence + true 14-day gating is backend. Store now holds ≥2 scans → ready for Ratings history / before-after / timelines (items 22–24).
- **Session 13 (2026-06-14):** Share functionality (P2 items 25+26, pulled forward). Installed `react-native-view-shot` + `react-native-share`. New `src/components/share/ShareCards.tsx` (StreakShareCard [heatmap, no scores] + ScoreShareCard [exact per-trait percentiles + overall, no deltas]), `ShareSheet.tsx` (card preview + direct-social icon row Stories/X/WhatsApp/TikTok + "More" native sheet + Cancel), `SocialIcons.tsx` (monochrome brand glyphs), and platform-split `services/share.ts` (native: view-shot capture + react-native-share deep links) / `share.web.ts` (stub → navigator.share). Wired: Streak screen "Share streak" → streak card; Results header "Share" → score card. PRD §5.3/S6 updated with the icon-row + More strategy. `docs/SHARING.md` documents native config (FB App ID, Info.plist schemes) + device-only verification. Verified on web: both cards render, sheet opens, taps don't crash. tsc + lint clean. NOTE: actual capture + social shares are device-only (native modules, not web/Expo Go) — same constraint as RevenueCat.
- **Session 12 (2026-06-13):** PRD changes + heatmap relocation (owner decisions). **Sharing (PRD §5.3/§5.1/§5.5/S6/§8):** replaced the progress-delta card with a **per-scan score card** (exact per-trait percentiles + overall, no deltas) behind an **always-on Share button** on Results + every Ratings entry; in-app before/after stays, only the shared artifact is single-scan. Flagged that this reverses v2's "share wins, not raw ratings" stance — kept percentile framing so the §2 guardrail holds. **Heatmap moved out of Profile** to a dedicated **Streak screen** (Duolingo tap-through model, chosen over inline-Results / top-of-Practice). New `src/screens/StreakScreen.tsx` (heatmap + Day/Longest/milestone + freeze + Share button [stubbed, item 25] + "Go to today's plan" link); Results streak banner now opens it (overlay-state pattern); removed the streak section from `ProfileScreen.tsx` (Profile = Subscription/About/Privacy). PRD §3 + §5.6 updated. Verified in browser: banner → Streak screen renders, Profile clean. tsc + lint clean. NOTE: per-scan share card + streak Share button are PRD/placeholder only — actual export is P2 items 25/26.
- **Session 11 (2026-06-13):** Streak system + heatmap + freeze (PRD §5.3 — items 19+20). New `src/services/streak.ts` (dateKey, deterministic `seedHistory`, `currentStreakDay`/`longestStreak`/milestones, `buildHeatmap` weekday-aligned grid), `src/store/StreakContext.tsx` (seeds history once, reads live today count from Practice+Onboarding plan tasks, exposes currentDay/longest/milestone/heatmap/tasksLeftToday + freeze token), `src/components/StreakHeatmap.tsx` (GitHub-style, cream-opacity intensity, today outlined). Profile gained a Streak section (Day N / Longest / milestone progress / heatmap / freeze status). Results streak banner is now live off `useStreak()` and the hardcoded `getStreak()` placeholder was removed from `progress.ts`. Verified in browser: Profile shows Day 12 + seeded heatmap; completing the Jawline workout flipped the Results banner "1 task left" → "all done today ✓" and filled today's heatmap cell. tsc + lint clean. NOTE: streak history is seeded mock (like scores) — real day-rollover, persistence, and auto-freeze-on-break are backend.
- **Session 10 (2026-06-13):** Practice screen — P1 opener (PRD §5.2/S5 — items 16+17+18). New `src/types/practice.ts` (trait→plan content: 4 workouts w/ step tutorials, 3 routines w/ AM/PM tasks, task-id helpers), `src/store/PracticeContext.tsx` (in-memory daily completion store above the tabs, exposes isDone/toggle + per-trait done/total — ready for the streak system to read), `src/screens/practice/WorkoutDetailScreen.tsx`, `src/screens/practice/RoutineDetailScreen.tsx`. Rewrote `PracticeScreen.tsx` as the hub: "Your plan" pinned from concerns + "More to explore" full taxonomy, each card monoline glyph + Workout/Routine + "Targets Top X%" + today's status, routing to detail overlays (same pattern as Profile/methodology). Verified in browser: hub renders, workout mark-complete persists to hub (✓), routine checkbox toggles update "X of Y done today". tsc + lint clean. NOTE: Results streak banner still uses the hardcoded `getStreak()` placeholder — wiring it to `PracticeContext` completion counts is item 19 (streak system).
- **Session 9 (2026-06-13):** Profile basics (PRD §5.6 — item 14). New `src/screens/MethodologyScreen.tsx` ("How scoring works" — what we evaluate / what a percentile means / why lighting & angles matter / how to move scores, non-shame tone). Rewrote `ProfileScreen.tsx` as a sectioned hub (Subscription / About / Privacy) with a reusable Row; added delete-my-photos with an in-app confirm overlay (RN `Alert` doesn't render on web) wired to a new `CLEAR_PHOTOS` reducer action; row reflects cleared state ("No photos stored"). Verified in browser: Pro status, methodology open/back, delete → confirm → state cleared. tsc + lint clean. **P0/MVP is now functionally complete (items 1–14 done; 15 is dashboard/device work).**
- **Session 8 (2026-06-13):** Unlocked Results screen (PRD §5.1/S3 — items 11+12+13). `RingGauge` extended with optional `centerLabel`; `src/components/TraitGrid.tsx` (concern-first ordering, two ring sizes, "Top X% of men" percentile-primary framing, 0–10 score secondary, per-card CTA into the mapped plan); `src/services/progress.ts` (streak + re-scan placeholders until P1 items 19/21); scoring helpers `topPercentLabel`/`scoreLabel`. ResultsScreen subscribed state now renders streak banner (above fold) → grid → re-rate-in-14-days card; featured CTAs + streak banner navigate to Practice via `useNavigation`. Verified in browser: unlock → full grid renders, CTA routes to Practice. tsc + lint clean. **This completes the P0 Results surface.**
- **Session 7 (2026-06-13):** Navigation fix to match PRD §3 (resolved the prior blocker). Avatars is now a real tab (replacing the Capture tab slot); the five tabs are Results, Practice, Avatars, Ratings, Profile. Emoji tab icons replaced with monoline SVG glyphs (`src/components/icons/NavIcons.tsx`). Capture is now a floating 56px blue FAB (`src/components/CaptureFab.tsx`) on Results + Ratings only — a free user's FAB tap opens the paywall; subscribed is a placeholder until the re-scan flow (item 21). Verified all five tabs route and the FAB shows only on Results/Ratings. tsc + lint clean.
- **Session 6 (2026-06-13):** RevenueCat SDK integration. Installed `react-native-purchases` + `react-native-purchases-ui` (10.3.0). New `src/services/purchases.ts` (native) + `purchases.web.ts` (web stub) — platform-file split so the native module never enters the web bundle (Metro can't resolve RN-only packages on web even behind a runtime guard). Rebuilt `SubscriptionContext` to configure on mount, hydrate from the `Looksmaxxing Pro` entitlement, listen for customer-info updates, and run real purchase/restore. PaywallScreen now reads live offering prices (placeholder fallback on web/dev) with purchasing state + error handling; ProfileScreen gained subscription status, Customer Center ("Manage subscription"), and restore. RevenueCat Paywall + Customer Center helpers wired for the P2 A/B program. Web dev loop verified (bundle builds, onboarding renders). `docs/REVENUECAT.md` documents dashboard setup, keys, and the platform split. tsc + lint clean.
- **Session 5 (2026-06-12):** Hard paywall (PRD §4.3/S10). New: `src/types/traits.ts` (trait taxonomy + plan mapping), `src/services/scoring.ts` (mock percentiles until AI backend), `src/components/RingGauge.tsx` (single ring-gauge component, obscured mode blurs the numeral via text-shadow — no blur dep), `src/components/BlurredTraitGrid.tsx` (shared by paywall + locked Results), `src/store/SubscriptionContext.tsx` (subscribed/paywallVisible; `subscribe()` stub for IAP), `src/screens/PaywallScreen.tsx`. App.tsx opens paywall on onboarding complete and overlays it whenever `paywallVisible`. ResultsScreen locked state added. Verified full loop in browser: capture → paywall → decline → locked Results → re-ask → plan toggle → unlock. tsc + lint clean.
