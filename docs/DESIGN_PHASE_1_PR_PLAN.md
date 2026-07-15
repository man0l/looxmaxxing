# Design Phase 1 — Foundation PR Plan

**Branch:** `docs/design-phase-1-foundation` (this plan)  
**Implement on:** `feat/design-phase-1-foundation` (suggested stack base)  
**Base:** `master`  
**Product goal:** Kill the “tokenized template” feel without redesigning product logic. After Phase 1, screens should feel like a warm room with materials and intentional press language — not a flat list of identical cards.

**Out of scope (later phases):** animated thick ring gauges, Results composition rewrite, scan-motif Lottie, Day Complete ceremony, streak-as-fire, paywall metal treatment, Practice micro-delight. See analysis session notes; those are Phase 2–3.

---

## Problem (why Phase 1 exists)

The Celestial Ember system is distinctive on paper (`docs/DESIGN.md`). Runtime mostly applies:

`surface + 1px border + 22px radius + 16px padding` on a flat `#15100B` fill.

Gaps vs design system that Phase 1 closes:

| Spec (DESIGN.md) | Master today | Phase 1 target |
|------------------|--------------|----------------|
| Background gradient `#15100B → #0E0B07` | Flat `colors.background` on tab screens | Shared `ScreenShell` gradient |
| SF Pro Rounded / Nunito fallback | `fontFamily: 'System'` | Loaded rounded family wired in `typography` |
| Card / banner-premium / materials | Inline `StyleSheet` copies | Role-based components |
| Celestial ornament inside banners | None | `CelestialOrnament` + premium banner |
| Soft ambient halo on FAB (blur ≥24, opacity ≤25%) | Solid FAB + hard shadow | Soft blue halo, no hard drop shadow |
| Interaction language | Bare `Pressable` | Shared press scale + opacity |

**Prior art (do not reinvent blindly):** branch `fix/celestial-ember-design-gaps` already has early `Card`, `BannerPremium`, `CelestialOrnament`, `BadgeUrgency`, `PillSegment`, FAB halo, and partial screen swaps. It is **not** full Phase 1 (no multi-role cards, no `ScreenShell`, no font loading, no shared press primitive). Prefer cherry-picking / rewriting those files onto a fresh `master`-based stack rather than rebasing the old branch wholesale.

---

## Design constraints (non-negotiable)

From `docs/DESIGN.md` + `AGENTS.md` / `Claude.md`:

1. Warm dark only — never pure `#000`, never cold grays.
2. Depth via tonal steps + 1px borders — **no hard drop shadows** as primary elevation.
3. Blue = interactive only; bronze = premium only (max one bronze banner per screen); cream = data/selection; ember orange = badge-scale urgency only.
4. Ornament lives **inside** surfaces at ≤25% opacity — never free-floating on the page background.
5. One illustration style: monoline cream / bronze constellation dots.
6. TypeScript only; theme tokens only (no one-off hex in screens unless added to `src/theme/`).
7. No product feature creep (no new tabs, paywall logic, scan API, streaks math).
8. Honor reduced motion for any press animation (skip scale if `AccessibilityInfo` / reduce-motion preference is on — implement if cheap; document if deferred to Phase 2 motion kit).

---

## Success criteria (Phase 1 done when)

- [ ] Every primary tab root (Results, Practice, Avatars, Ratings, Profile) and Methodology use `ScreenShell` (or equivalent shared gradient root) — no flat solid background as the only layer.
- [ ] Rounded type is loaded once at app boot; all `typography.*` tokens use it (iOS SF Pro Rounded if available, else bundled Nunito Sans).
- [ ] `Card` supports at least four **roles**: `quiet` | `hero` | `inset` | `premium` (premium wraps bronze + ornament).
- [ ] At least one real premium surface uses `BannerPremium` / `premium` role with inset ornament (e.g. locked Results unlock banner or Profile subscription row).
- [ ] Shared `PressableScale` (name flexible) used on major tappable cards/CTAs in Results + Practice + CaptureFab; scale ≈ 0.97, short spring/timing.
- [ ] Capture FAB matches design: primary fill + soft ambient halo; hard black shadow removed or reduced to negligible.
- [ ] `npx tsc --noEmit` and `npx expo lint` clean.
- [ ] Visual smoke on web (375×812): Results (locked + unlocked), Practice, Profile, Paywall open — no layout regressions, no pure black, no cold gray.

---

## PR stack (recommended)

Ship as **3 small PRs** stacked on `master` so review stays focused. One mega-PR is acceptable only if timeboxed and each section remains independently verifiable.

```
master
  └── PR-A  feat/design-p1-shell-type
        └── PR-B  feat/design-p1-materials
              └── PR-C  feat/design-p1-press-adopt
```

---

### PR-A — Screen shell + typography

**Branch:** `feat/design-p1-shell-type`  
**Intent:** Atmosphere and voice of type. No component API churn yet.

#### A1. Theme / type

| File | Change |
|------|--------|
| `package.json` | Add `@expo-google-fonts/nunito-sans` (or load TTF via `expo-font` from `assets/fonts/`). Prefer Expo Google Fonts for zero asset friction. |
| `src/theme/typography.ts` | Replace `fontFamily: 'System'` with tokenized family name constant, e.g. `fontFamily: fonts.sans`. Keep size/weight/lineHeight specs from DESIGN.md. |
| `src/theme/fonts.ts` (new) | Export `fonts.sans`, `fonts.sansSemiBold` if platform requires weight-specific family names. |
| `src/theme/index.ts` | Re-export fonts. |
| `App.tsx` | `useFonts` (expo-font / @expo-google-fonts) before `appReady`; keep existing onboarded hydrate gate. Splash/null until fonts ready (same as current `appReady` null). |

**iOS note:** SF Pro Rounded is a system face on Apple platforms. Prefer:

```ts
Platform.select({
  ios: 'SF Pro Rounded', // or ui-rounded via system if available
  default: 'NunitoSans_400Regular', // loaded
})
```

Document exact family strings that work on iOS simulator in the PR description after device check. If SF Pro Rounded is unreliable under RN, ship Nunito Sans everywhere for Phase 1 consistency (acceptable trade).

#### A2. Screen shell

| File | Change |
|------|--------|
| `src/components/ScreenShell.tsx` (new) | Full-bleed `expo-linear-gradient` using `colors.background` → `colors.backgroundGradientEnd`. Props: `children`, optional `edges` / safe-area, optional `style`, optional `contentStyle`. **Optional:** very soft top cream wash (≤4% opacity stop) — must not read as a second brand color. |
| Tab roots | Wrap root of: `ResultsScreen`, `PracticeScreen`, `AvatarsScreen`, `RatingsScreen`, `ProfileScreen`, `MethodologyScreen`. Replace `backgroundColor: colors.background` on root/scroll with transparent where shell shows through. |
| `OnboardingNavigator.tsx` | Already uses gradient — leave as-is **or** migrate to `ScreenShell` for one code path (prefer migrate if API is trivial). |
| `PaywallScreen.tsx` | Use shell or same gradient (paywall is full-screen overlay; should not flash flat black behind). |
| Share cards | **Do not** change `ShareCards.tsx` background without checking capture contrast — share artifacts may keep solid `background` intentionally. |

#### A3. Explicit non-goals for PR-A

- No card API, no ornament, no press scale.
- No Results layout rewrite.
- No RingGauge changes.

#### A4. Test plan

1. Cold start → fonts load → no FOUT flash if possible (null until ready is OK).
2. All 5 tabs: gradient visible (slightly darker toward bottom).
3. Onboarding still gradients correctly.
4. tsc + lint.

---

### PR-B — Materials (card roles + ornament + FAB)

**Branch:** `feat/design-p1-materials` (from PR-A)  
**Intent:** Surfaces have roles. Premium reads bronze; quiet lists stay quiet.

#### B1. New / upgraded components

| File | Change |
|------|--------|
| `src/components/CelestialOrnament.tsx` (new) | Monoline rays + constellation dots. Props: `size`, `opacity` (default ≤0.22), `variant?: 'onBronze' \| 'onSurface'`. `onBronze` uses dark copper stroke (`onSecondary` / `#2A1D10` at low alpha); `onSurface` uses cream/bronze at ≤25% opacity. `pointerEvents="none"`. |
| `src/components/Card.tsx` (new) | Role-based surface: |
| | `role: 'quiet' \| 'hero' \| 'inset' \| 'premium'` (default `quiet`) |
| | `quiet` = current card token (surface + border + lg radius + lg pad) |
| | `hero` = surfaceRaised or subtle vertical gradient surface→raised, slightly more padding (`spacing.xl`), same radius |
| | `inset` = surfaceInset background, same border language |
| | `premium` = bronze fill, onSecondary text context, hosts `CelestialOrnament` absolutely positioned |
| | Optional `onPress` → wire to press primitive only after PR-C lands; for B use plain Pressable or leave View-only |
| `src/components/BannerPremium.tsx` (new) | Thin wrapper: `Card role="premium"` + title/subtitle slots **or** children-only like prior art. Max one usage guidance in JSDoc. |
| `src/theme/components.ts` | Extend tokens for `cardHero`, `cardInset`, `bannerPremium` padding alignment if needed. Keep single source of truth for radii/padding. |
| `src/components/CaptureFab.tsx` | Soft ambient blue halo (opacity ≤0.25, larger radius than 56px button). Remove hard black `shadowColor: '#000'` stack; elevation optional on Android only if needed for touch target affordance. |
| `src/components/BadgeUrgency.tsx` (optional same PR) | Only if a screen already needs it; otherwise skip to avoid scope creep. |
| `src/components/PillSegment.tsx` (optional) | Same — only if replacing an existing ad-hoc pill in Phase 1 adopt list. |

**Reference implementation:** cherry-pick shapes from `fix/celestial-ember-design-gaps` (`Card`, `BannerPremium`, `CelestialOrnament`, FAB halo) then **upgrade** `Card` to multi-role.

#### B2. Adopt materials on high-traffic surfaces (minimum set)

Do **not** boil the ocean. Minimum for PR-B:

| Screen / component | Adoption |
|--------------------|----------|
| `ResultsScreen` locked unlock banner | `BannerPremium` or `Card role="premium"` |
| `ResultsScreen` streak banner | `Card role="hero"` or `quiet` with raised tone — not identical to trait cards |
| `TraitGrid` featured cards | `Card role="quiet"` or `hero` (pick one; featured slightly richer than rest) |
| `TraitGrid` rest cards | `Card role="quiet"` denser, or keep layout and only share border tokens |
| `PracticeScreen` plan cards | `Card` quiet/hero |
| `ProfileScreen` subscription / rows | Premium only if monetization moment; else quiet |
| `DayCompleteMoment` sheet | `Card role="hero"` or raised quiet — still **not** Phase 3 ceremony |

Inline styles that only set the same surface+border+radius should call `Card` instead of duplicating.

#### B3. Explicit non-goals for PR-B

- No animation beyond existing app patterns.
- No font work (belongs in A).
- No full Profile/Avatars visual redesign.
- Ornament variants beyond banner use are optional; don’t scatter ornament on every card.

#### B4. Test plan

1. Locked Results: bronze unlock banner with visible low-opacity ornament, readable onSecondary text.
2. Unlocked Results: trait cards still tappable; hierarchy hero vs quiet visible.
3. FAB: soft halo, no muddy black oval.
4. tsc + lint; web smoke.

---

### PR-C — Press primitives + adoption

**Branch:** `feat/design-p1-press-adopt` (from PR-B)  
**Intent:** Shared interaction language so the app feels physical, not static HTML.

#### C1. Primitive

| File | Change |
|------|--------|
| `src/components/PressableScale.tsx` (new) | Reanimated `Pressable` (or RN Pressable + reanimated shared value): scale 1 → 0.97 on pressIn, spring back on pressOut. Props mirror Pressable (`onPress`, `disabled`, `accessibilityRole`, `style` as function or static). Disable animation when reduce-motion is enabled if implemented. |
| `src/components/Card.tsx` | When `onPress` set, use `PressableScale` instead of bare Pressable. |
| `src/components/CaptureFab.tsx` | Press scale on the FAB circle (halo stays put). |
| Primary CTAs | Results plan links, Practice cards, Paywall subscribe button, Day Complete buttons, Profile rows that navigate — adopt where low-risk. |

**Dependency:** `react-native-reanimated` already in package.json — do not add Moti unless necessary.

#### C2. Light haptic (optional, native-only)

| File | Change |
|------|--------|
| `src/hooks/useTapHaptic.ts` (optional) | `expo-haptics` selection/light impact on important completes only if package added. **Prefer defer** if it requires new native dependency work in this phase — press scale alone is enough for C. |

#### C3. Explicit non-goals for PR-C

- No screen transition choreography (overlay fade/rise) — Phase 2 motion kit.
- No ring draw-in, no confetti, no scan sweep.

#### C4. Test plan

1. Press featured trait card / practice card: visible scale, no layout jump.
2. Disabled FAB: no scale / reduced opacity.
3. Web: no crash if reanimated web path differs (verify).
4. tsc + lint.

---

## File inventory (expected end state)

**New**

- `src/components/ScreenShell.tsx`
- `src/components/Card.tsx`
- `src/components/BannerPremium.tsx`
- `src/components/CelestialOrnament.tsx`
- `src/components/PressableScale.tsx`
- `src/theme/fonts.ts` (if not inlined)

**Touched**

- `App.tsx`
- `src/theme/typography.ts`, `components.ts`, `index.ts`
- `src/components/CaptureFab.tsx`
- `src/components/TraitGrid.tsx`
- `src/screens/ResultsScreen.tsx`
- `src/screens/PracticeScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/AvatarsScreen.tsx`
- `src/screens/RatingsScreen.tsx`
- `src/screens/MethodologyScreen.tsx`
- `src/screens/PaywallScreen.tsx`
- `src/navigation/OnboardingNavigator.tsx` (optional unify)
- `src/components/DayCompleteMoment.tsx` (materials only)
- `package.json` / lockfile (fonts)

**Do not touch in Phase 1**

- `src/services/*` business logic
- Scan / subscription / streak math
- `RingGauge` stroke/animation (Phase 2)
- Share card pixel layout (unless shell forces a one-line bg fix)
- PRD feature set / excluded features

---

## Implementation order (for the implementer)

1. Land PR-A fully before any card migration (shell changes touch many roots — isolate).
2. Build ornament + Card API in isolation; Story-less: temporary usage only on Results locked banner first.
3. Migrate TraitGrid + Practice cards.
4. FAB halo.
5. PressableScale + wire Card/FAB/CTAs.
6. Visual pass + tsc/lint.
7. Update `AGENTS.md` changelog with session note when merged.

---

## Review checklist (for each PR)

- [ ] Matches DESIGN.md color roles (no decorative blue, no large orange).
- [ ] No new pure black / cold gray.
- [ ] No hard drop shadows reintroduced as elevation system.
- [ ] Ornament only inside premium/hero surfaces, opacity ≤25%.
- [ ] No `.js` files; theme tokens used.
- [ ] No feature scope creep.
- [ ] Web bundle still serves; primary tabs render.

---

## Phase boundary (what “living” still needs after this)

Phase 1 makes the shell **richer and more intentional**. It will **not** fully solve “simplistic product moments.” Next:

| Phase | Focus |
|-------|--------|
| **2** | Signature data — thick animated rings, Results hero composition, staggered reveal |
| **3** | Rituals — scan motif, Day Complete ceremony, streak heat language, practice micro-delight |
| **4** | Monetization polish — paywall materials, bronze as metal |

Do not pull Phase 2 into Phase 1 PRs.

---

## Open decisions (resolve in PR-A description)

1. **Font:** Nunito Sans everywhere vs iOS SF Pro Rounded + Android Nunito.
2. **Shell top wash:** none vs ≤4% cream vignette (recommend try on Results only first).
3. **Card `hero` fill:** solid `surfaceRaised` vs subtle gradient (prefer solid first for performance/simplicity; gradient only if still flat).
4. **Whether to merge `fix/celestial-ember-design-gaps` pieces** or reimplement cleanly on master (recommend reimplement/cherry-pick files, not full branch merge).

---

## Effort estimate

| PR | Size | Rough effort |
|----|------|--------------|
| A Shell + type | M | 0.5–1 day |
| B Materials + adopt | M–L | 1–1.5 days |
| C Press + wire | S–M | 0.5 day |

**Total Phase 1:** ~2–3 focused days including visual smoke.

---

## Suggested first commit messages (when implementing)

```
feat(design): ScreenShell gradient + rounded typography (P1-A)
feat(design): role-based Card, ornament, premium banner, FAB halo (P1-B)
feat(design): PressableScale and adopt on cards/CTAs (P1-C)
```
