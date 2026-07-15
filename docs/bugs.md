# Backlog — triaged from raw notes (2026-07-14)

Source: raw shorthand notes dropped in chat, expanded here with current-behavior context so each item is actionable. `[?]` in the original note means the note itself was ambiguous — flagged below with a suggested clarifying question rather than a guessed scope.

Legend: **FE** = app-only change · **BE** = needs a backend/dashboard/server change · **FE+BE** = both.

---

## Resolved

| # | Item | Merged | PR | Details |
|---|------|--------|-----|---------|
| B1 | Routine completion can silently drop other completions | 2026-07-14 | #28 | `PracticeContext` day sync is atomic; rollover runs on hydrate, foreground, and 60s interval — not inside every `toggle()`. |
| B2 | Photo deletion doesn't clear cached avatar renders | 2026-07-14 | #27 | `CLEAR_PHOTOS` clears local `renderCache` and calls `DELETE /v1/user-data` to purge server renders. Remaining gap: scan `photoUri` on device is not cleared — separate item. |
| B3 | Avatar style label disappears once the real render loads | 2026-07-14 | #30 | `AvatarRender` overlays the style chip on loaded images; `AvatarPreviewScreen` uses `AvatarRender` for both placeholder and real render. |
| B4 | Rapid avatar style taps fire overlapping render requests | 2026-07-14 | #30 | 300ms debounce on style pills, `AbortController` through `submitRender`, display URL gated to selected style. Server-side rate limit still open — see BE1. |
| A1 | Re-entrancy guard around purchase/restore calls | 2026-07-14 | #29 | Shared `billingInFlight` lock in `purchases.ts` / `purchases.web.ts`; RC native paywall respects the same lock. |
| A4 | "Restore purchases" doesn't invalidate backend entitlement cache | 2026-07-15 | — | `subscribe()` calls `invalidateEntitlementCache()` on a successful purchase so `/v1/scans/uploads` doesn't hit a stale negative cache entry; `restore()` was missing the same call, so a freshly-restored user could immediately hit "mint upload slots failed: No active \"Looksmaxxing Pro\" entitlement" until the backend TTL expired. `SubscriptionContext.restore()` now invalidates on `result.pro`. |
| A5 | Paywall silently skipped after "Delete all my data" for an active subscriber | 2026-07-15 | — | `deleteAllUserData()` → `Purchases.logOut()` triggers RevenueCat's automatic App Store receipt resync onto the new anonymous user, firing the `customerInfo` listener with an active entitlement — sometimes landing *after* `runPostDeletionReset()`, silently flipping `subscribed` back to `true` before onboarding's `if (!subscribed) openPaywall()` check ran. Contradicted the deletion dialog's own copy ("use Restore purchases to re-link it"). Fixed with a `suppressAutoRestoreRef` in `SubscriptionContext` that ignores listener-driven reactivation until the user explicitly taps Subscribe or Restore. |
| — | One-way routine/workout completion (unreported) | 2026-07-14 | #28 | `complete()` in `PracticeContext`; routine checklist + workout session CTA cannot unmark once done for the day. |
| — | E2E web funnel out of date with redesigned onboarding | 2026-07-14 | #31 | Shared `onboardingFlow` + `resetWebApp` helpers; stub + live Playwright suites pass (`npm run test:e2e`, `npm run test:e2e:live`). |

---

## Bugs

_None open._

---

## Features / UX

| # | Item | Scope | Details |
|---|------|-------|---------|
| F1 | Post-routine completion → result + share-streak moment | FE | On last task of the day, show completion state (streak count) with "Share streak" CTA reusing `StreakShareCard` / `ShareSheet`. |
| F2 | Upsell Avatars after routine completion | FE | Soft prompt after completion deep-linking to `AvatarPreviewScreen` via `focusTrait`. Natural pairing with F1. |
| F3 | Faster-feeling avatar preview: blurred/pixelized placeholder → sharp render | FE+BE | FE: blur-up of low-res pass; BE: investigate render latency (see BE3). |
| F4 | Description text too small | FE | Bump description usages from `bodySm` (13px) to `bodyMd` (15px), or add a dedicated token. |
| F5 | Back gesture — tap left edge to return to previous screen | FE | Detail screens are overlay state, not stack screens. Either add left-edge tap handlers or migrate to native-stack. |
| F6 | Eyes trait page missing chart | FE (maybe data) | `ScoreTimeline` renders the same for every trait; needs repro — likely mock-scoring data gap for real backend design. |
| F7 | Remove header link from privacy policy | FE — **needs clarification** | Unclear which surface: external privacy-policy page, paywall footer, or elsewhere. Ask before touching. |
| F8 | Profile / side picture | FE | `profilePhoto` captured in onboarding but never shown in `ProfileScreen`. Show captured photo or placeholder; tappable to view/retake. |
| F9 | Women's flow / gender-aware copy | FE — **needs product decision** | No gender field; copy is male-only. Touches trait taxonomy, percentile cohort, PRD guardrails — needs scoping pass. |

---

## Account & Subscription

| # | Item | Scope | Details |
|---|------|-------|---------|
| A2 | Account deletion | FE+BE | Wipe all local data + RevenueCat customer + any server-side retention. Required for App Store review. |
| A3 | Subscription cancellation should actively revoke access | BE | Server-side webhook handling so cancelled/refunded subs revoke paid endpoints immediately, not just SDK cache expiry. |

---

## Backend / infra needed

| # | Item | Details |
|---|------|---------|
| BE1 | Avatar render rate limiting | Server-side rate limit per user/tier; clear client message on 429. Client debounce done (B4); server half still needed. |
| BE2 | RevenueCat webhook → entitlement revocation | See A3. Webhook receiver or REST polling on scan-scoring backend. |
| BE3 | Avatar render latency | Investigate generation pipeline; consider two-stage fast low-res → high-res API for F3. |
| BE4 | Account deletion backend hooks | See A2 — delete RevenueCat customer / retained data on account-deletion request. |

---

## Net-new feature (needs scoping)

| # | Item | Details |
|---|------|---------|
| N1 | FaceApp / Apple integration — lip editing (realistic vs. intelligent) | Net-new; note flagged `[?]`. Conflicts with PRD avatar guardrails (styling preview, not predicted result). Do not start until scoped. |

---

## Suggested next step

Bugs cluster is clear. Pick **F1 + F2** as one retention push (completion moment + Avatars upsell), or **A2** for App Store compliance. **F7, F9, N1** need a clarifying answer before they're actionable. **BE1–BE4** belong on the backend board alongside the mock-surfaces migration in `AGENTS.md`.