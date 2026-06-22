# PRD v2: Face Rating & Improvement App (New Product)

**Status:** Draft v2.0 — supersedes v1 (onboarding PRD)
**Owner:** Manol
**Date:** June 2026
**Platform:** iOS, subscription via Apple ID
**Basis:** Competitive teardown of 10 screens from an existing App Store competitor ("Looksmax Rating AI"). This is a new app; no legacy constraints.

---

## 1. Strategy

The competitor has the right ingredients (AI scoring, trait advice, workouts, avatars) but no connective tissue: no progress loop, no monetization spine, mismatched trait→workout taxonomy, inconsistent navigation, and a social feed with no payoff. The new app wins on **funnel discipline and retention loops**, not on feature count.

**Business model:** Hard paywall. The AI face scan — the core value — is fully gated. Free users can complete onboarding and capture, but results require subscription. This maximizes ARPU and makes trial-to-paid the single funnel metric that matters.

**Re-engagement model:** Zero push notifications, zero email. All return behavior is driven in-product by streaks, loss aversion, and re-scan milestones, and out-of-product by **user-shared streak/score cards** on social media (which double as organic acquisition).

**Core loop:**

> Scan (paid) → personalized plan → daily routine check-ins → streak grows → share card → re-scan at day 14 → score moves → renew

## 2. Goals & Metrics

| Goal | Metric | Target |
|---|---|---|
| Monetize the scan | Install → paid conversion | ≥ 8% (hard-paywall benchmark range 5–12%) |
| ROI | CAC payback | < 30 days |
| Retention without notifications | D7 / D30 retention of subscribers | ≥ 45% / ≥ 25% |
| Organic acquisition | % of installs from shared cards (attributed) | ≥ 15% by M3 |
| Habit formation | % of subscribers with ≥ 7-day streak in first 14 days | ≥ 35% |

**Guardrails (binding, carried from v1):** age gate 17+; concerns are user-selected, never asserted pre-scan; percentile framing, no verdict/shame copy; no demeaning content (App Store Guideline 1.1); accurate privacy labels for face data; refund rate and 1-star tone-complaint rate may not regress release-over-release.

## 3. Information Architecture

Five fixed tabs, identical on every screen:

| Tab | Purpose |
|---|---|
| **Results** | Latest scan, trait grid, re-scan countdown, score timelines, today's streak state (taps through to the Streak screen) |
| **Practice** | Workouts + daily routines, mapped 1:1 to scored traits; tutorials live here |
| **Avatars** | "Preview your potential" — outcome visualization linked to traits |
| **Ratings** | Personal rating history: every past scan, before/after comparisons. **No community feed.** |
| **Profile** | Methodology, subscription, settings, privacy controls |

Photo capture is a floating action button on Results and Ratings — an act, not a destination.

**Trait taxonomy (locked):** every scored trait routes to exactly one destination. Jawline → Jawline workout. Face → Cheekbones workout. Masculinity → Posture workout. Smile → Smile workout (and Smile becomes a scored trait so the workout isn't an orphan). Skin → Skin routine. Hair → Hair routine. Eyes → Eyes routine. No scored trait dead-ends; no workout without a score feeding it.

## 4. Funnel Specification

### 4.1 Onboarding (from v1, updated for hard paywall)
1. **Age gate** (17+; under-17 polite exit).
2. **Welcome & promise** — one sentence, one CTA. No unverifiable badges ("#1", "100% guaranteed").
3. **Concern selection** — "What would you like to work on?" multi-select max 3, options locked to the trait taxonomy. Microcopy: "Most guys pick 2–3. This shapes your plan."
4. **One depth question** on the top concern (hard limit: one).
5. **Expectation framing** — explains percentile model ("most guys land between 4 and 7; every trait comes with a plan"). Pre-frames mid scores as normal-and-improvable.
6. **Guided capture** (see 4.2).
7. **Hard paywall** (see 4.3).

### 4.2 Guided capture
- Multi-angle: front + side profile, with alignment overlay per angle (competitor asks for front only but displays profile shots in results — jawline scoring needs the profile).
- On-device lighting/quality check before submission; retake prompt if failed. This kills the "different photo, different score" complaint class before it exists.
- One-line privacy disclosure on the capture screen (face-data processing).
- **Assets:** good-example photo `onboarding-flow-image1.png` (front-facing,
  even light → "Like this" chip); bad-example photo `onboarding-image-2.png`
  (turned, half-shadowed → "Too dark" chip); instruction loop
  `onboarding-for-selfie-taking-asset.mp4` (5s, 624×624, model rotating
  front → profile, demonstrating the two-angle sequence; autoplay muted,
  looped, above the viewport).

### 4.3 Hard paywall (the most important screen in the app)
- **Placement:** after capture and processing, before any score is revealed.
- **Mechanic:** show the real results screen with scores blurred and trait names visible, plus one unblurred personalization token: "Your **jawline** analysis is ready" (from concern selection). The user has already invested a selfie and 60 seconds — the blur converts that sunk cost.
- **Offer structure:** weekly plan + annual plan; annual pre-selected. No free trial in v1 (hard paywall + trial dilutes; test trials only after baseline conversion is known).
- **UX notes:** single screen, no carousel; restore-purchases link; price-per-week framing on annual; the three benefit bullets are the user's own three selected concerns mirrored back. Decline path = "Maybe later" returns to a locked Results tab showing the blurred grid (persistent, quiet re-ask — not a popup).
- **Compliance:** clear billing terms, App Store-compliant close affordance.

## 5. Feature Specifications

### 5.1 Results
- Trait grid using a single ring-gauge component at two sizes: user's selected concerns large and first, remaining traits small below.
- Percentile framing ("Top 21% of men") primary; numeric score secondary; no color-coded verdict badges.
- **Re-scan countdown** card: "Re-rate in 14 days" — the bi-weekly milestone is the renewal heartbeat.
- Tapping a trait opens trait detail: percentile, type breakdown, score timeline (after ≥ 2 scans), single CTA into its mapped workout/routine.
- **Share** button always present on the scan — exports the scan score card (exact per-trait percentiles + overall score) per §5.3; opt-in, never auto-posts.

### 5.2 Practice (workouts + routines)
- **Workouts** (exercise-based: jawline, cheekbones, posture, smile): session-based content with completion tracking; tutorials embedded here.
- **Routines** (habit-based: skin, hair, eyes): competitor's static advice paragraphs converted into **checkable daily tasks** (AM/PM checklists). Each completed day feeds the streak.
- "Your plan" header pins concern-matched items to top.

### 5.3 Streaks (GitHub-style) — the retention engine
- **Contribution graph:** a GitHub-style heatmap on a dedicated **Streak screen** (reached by tapping the streak banner on Results, Duolingo-style) — one cell per day, intensity = tasks completed (routine check-ins + workout sessions + scans). Instantly legible as commitment. Lives one tap from the primary surface, not buried in Profile.
- **Streak counter** with milestone states (7 / 14 / 30 / 90 days).
- **Share cards:** an always-on **Share** button on every scan exports (a) streak card — heatmap + streak count + app branding, and (b) **scan score card** — that scan's exact per-trait percentile ratings + overall score, **plus the per-trait and overall delta vs the previous scan** (▲/▼ in cream, percentile framing intact; shown only when a prior scan exists — the first scan shares with no deltas). *(Owner decision, reverses the earlier v2 "no deltas on the shared card" stance — bet that visible progress drives more sharing; revisit against share/post rate.)* Tapping Share opens a sheet showing the card preview plus **direct icons for Instagram Stories, X, WhatsApp, and TikTok** (each deep-links into that app with the card preloaded — e.g. straight into the IG Story editor, removing 2–3 taps) and a **"More" button** that opens the native OS share sheet (save to camera roll, copy link, iMessage/SMS, any installed app) as the universal fallback. Sharing **is opt-in and composed by the user** — the app never auto-posts. The Share button is persistent (on Results and on every entry in Ratings history), never gated behind milestones or a progress threshold. Scores appear as percentiles ("Top 21% of men"), never a color-coded verdict (§2 guardrail holds).
- **UX notes:** because there are no notifications, the streak must do the reminding *inside* the app — the Results tab shows today's streak state ("Day 12 — 2 tasks left today") above the fold, and tapping it opens the **Streak screen** (heatmap, milestones, streak Share button); a broken streak shows a one-time "streak freeze" mercy token (one per month) to soften loss without cheapening it. The share card is the only mechanism that reaches the user outside the app, so card design quality is a P0 concern, not a nice-to-have.

### 5.4 Avatars — "Preview your potential" (executed)
- Repositioned from gimmick to **outcome visualization**, linked to traits:
  - Low Hair percentile → "See yourself with a fade / buzz cut / crew cut" → render → CTA into Hair routine.
  - Jawline plan active → "Preview a sharper jawline" render at plan start; pinned next to the re-scan countdown as the goal image.
  - Smile workout → confident-smile render.
- Entry points live on trait detail screens and on Results ("See your potential"), not only on the Avatars tab.
- Avatars are a **subscriber feature** (everything is — hard paywall), but render credits can tier the annual plan upsell.
- UX note: one illustration/render style across the app; the competitor's cartoon-vs-photoreal mix reads cheap.

### 5.5 Ratings (personal history)
- Chronological list of every scan: date, thumbnail, overall percentile.
- Every scan carries the always-on **Share** button → its scan score card (exact ratings) per §5.3.
- Any two scans selectable for **before/after comparison**: side-by-side photos + per-trait deltas. (In-app comparison only; the shared card is always a single-scan score card, not a delta.)
- This tab replaces the competitor's community feed. **Excluded permanently:** public photo publishing, emoji reactions, human-vs-AI comparison, any social graph. Rationale: no payoff loop, moderation cost, App Store risk, dilutes the single-player value proposition.

### 5.6 Profile
- Subscription management, **"How scoring works"** methodology screen (what the model evaluates, what percentiles mean, why lighting/angles matter — the trust layer that preempts "this app is random" reviews), settings, privacy controls including delete-my-photos. (Streak heatmap moved to the dedicated Streak screen per §5.3; sharing happens per-scan on Results/Ratings and on the Streak screen.)

## 6. Excluded Scope (explicit)

1. Community feed / photo publishing / reactions / human-vs-AI rating comparison.
2. Push notifications, email, SMS — all channels. Re-engagement is in-product (streaks, countdowns) and social (share cards) only.
3. Free tier of the scan. No partial/teaser scores beyond the blurred-grid paywall mechanic.

## 7. Screen-by-Screen: Before (Competitor) → After (New App)

Each row is the spec seed for the per-screen design iterations that follow this PRD.

### S1 — Splash / first open
- **Before:** "LOOKSMAX RATING AI", "#1 AI Face Rating", "100% satisfaction guaranteed", "15k+ users" badges; black-and-white hero photo.
- **After:** one-sentence promise + single CTA into onboarding; verifiable social proof only (real rating count once earned); dark design system, lime accent.
- **UX notes:** unverifiable superlatives are an App Store metadata risk and read low-trust; the screen's only job is to start the funnel in one tap.

### S2 — Photo capture
- **Before:** "Take a front selfie", one lighting tip, upload-or-camera buttons; purple gradient background off-system.
- **After:** guided two-angle capture (front + profile) with alignment overlay, live lighting check, retake prompt on fail, privacy one-liner; do/don't example pair (`onboarding-flow-image1.png` / `capture-bad-example.png`) and the front→profile instruction loop (`onboarding-for-selfie-taking-asset.mp4`).
- **UX notes:** capture quality variance is the root of score-distrust complaints; control it at the source. Keep the flow ≤ 30 seconds.

### S3 — Results grid
- **Before:** six cards with three different gauge treatments, color-coded High/Normal verdict badges, "View advice" links on every card; no hierarchy.
- **After:** single ring-gauge component, two sizes; concern traits first and large; percentile primary; re-scan countdown card; today's streak state above the fold; one CTA per card into the mapped plan.
- **UX notes:** verdict colors (yellow = judgment) are the competitor's churn engine; percentile framing converts the same number into momentum.

### S4 — Trait detail (Jawline / Skin / Hair)
- **Before:** gauge + profile photo, "Trait Breakdown" type row, then static advice paragraphs (read-once).
- **After:** gauge + percentile + score timeline; type row kept; advice converted to checkable routine tasks or a workout entry CTA; "preview your potential" avatar entry where applicable.
- **UX notes:** the competitor's advice copy tone (practical, non-judgmental — e.g. its skincare cards) is the register to keep; the *format* is what changes.

### S5 — Practice / Workouts list
- **Before:** card list with mixed cartoon/photoreal illustrations, progress % bars with no destination, "FREE" badge on tab, taxonomy mismatched to scores.
- **After:** "Your plan" pinned section from concern selection; one illustration style; progress bars feed the streak; tutorials embedded per workout; full trait↔workout mapping per §3.
- **UX notes:** progress that doesn't visibly move a score is decoration — every workout card shows the trait percentile it targets.

### S6 — Share card
- **Before:** "You're a 7.2, Top 20% of men" full-trait-list card with social buttons.
- **After:** two card types behind an always-on Share button: streak/commitment card (heatmap, no scores) and **scan score card** (that scan's exact per-trait percentile ratings + overall score, no deltas). Share sheet = card preview + **direct icons (Instagram Stories, X, WhatsApp, TikTok)** that deep-link into each app with the card preloaded, plus a **"More"** button for the native OS share sheet (camera roll, copy, iMessage, any app). Clean branded export, opt-in, user-composed.
- **UX notes:** the Share button is persistent on every scan (Results + each Ratings-history entry) — any scan is one tap from a shareable card, never milestone- or progress-gated. Scores are framed as percentiles ("Top 21% of men"), never a color-coded verdict. This is the entire organic-acquisition channel — design it like a product, not an afterthought. **Reverses v2's earlier "share wins, not raw ratings" stance:** the per-scan exact-score card is now the primary results-share — a deliberate bet to validate against share/post rate.

### S7 — Ratings / community feed
- **Before:** public photo feed, emoji reaction counts, country flags, "Publish my photo"; no payoff, no visible moderation.
- **After:** removed. Tab becomes personal rating history with before/after comparison.
- **UX notes:** cutting this deletes the app's biggest moderation, privacy, and review-risk surface at zero cost to the core loop.

### S8 — Avatars
- **Before:** standalone gallery (hairstyles, emotions, "Hot" category) with a "Generate 200+ AI avatars" upsell banner; zero connection to scores.
- **After:** "Preview your potential" per §5.4 — trait-linked entry points, goal-image pinning, single render style; category naming cleaned up ("Hot" → style-descriptive labels).
- **UX notes:** the avatar is the emotional answer to "why keep going" — surface it where motivation lives (trait details, plan start), not in a side gallery.

### S9 — Navigation
- **Before:** tab set mutates between screens (Raitings/Tutorials swap), "Raitings" typo, six destinations in five slots.
- **After:** fixed five tabs (§3), capture as floating action, tutorials inside Practice.
- **UX notes:** stable nav is table stakes; the competitor's mutation reads as a bug and erodes trust in everything else.

### S10 — Paywall
- **Before:** not visible in any screenshot — monetization has no clear spine (a "FREE" badge on a tab is the only signal).
- **After:** the blurred-results hard paywall per §4.3 — the single most-designed screen in the app.
- **UX notes:** this is the new app's biggest structural advantage over the competitor; everything upstream (onboarding concerns, capture effort, expectation framing) exists to make this screen convert.

## 8. Roadmap & Shipping Priorities

**P0 — MVP (Weeks 1–6): the paid funnel.** Nothing ships without these.
1. Onboarding (age gate → concerns → depth → framing)
2. Guided two-angle capture + quality check
3. Scoring + Results grid (percentile, concern-first ordering)
4. Hard paywall (blurred results) + subscription infra
5. Fixed five-tab nav + Profile basics + methodology screen
   *Exit criteria: install→paid ≥ 5%, refund rate < 5%.*

**P1 — Retention release (Weeks 7–12): the reason to stay.**
6. Routines as daily checklists + workouts with tutorials (full taxonomy)
7. Streak system + heatmap + streak freeze
8. Re-scan flow + Ratings history + before/after comparison + score timelines
   *Exit criteria: D7 ≥ 40%, ≥ 30% of subscribers hit a 7-day streak.*

**P2 — Growth release (Weeks 13–18): the reason it spreads and renews.**
9. Share cards (streak card + per-scan score card, always-on Share button) with attribution links
10. Avatars "preview your potential" with trait-linked entry points
11. Paywall A/B program (annual framing, trial test, avatar-credit tier)
    *Exit criteria: ≥ 10% of installs attributed to shares; M2 renewal ≥ 60%.*

Sequencing logic: monetization spine first (ROI), retention loop second (LTV), virality third (CAC) — each release compounds the prior one's metric.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Hard paywall tanks activation | Blurred-results mechanic preserves sunk cost; pricing A/B in P2; trial tested only after baseline known |
| No notifications → streaks die quietly | In-app streak state above the fold on Results; streak freeze; share cards as the external touchpoint; if D7 misses P1 exit criteria, revisit the no-notification constraint with data |
| Face-data privacy scrutiny | Delete-my-photos control, accurate privacy labels, on-device quality checks where feasible |
| Tone drift toward shame copy over iterations | §2 guardrails binding; copy review gate on every release |
| Avatar renders overpromise outcomes | Renders labeled as previews/styling, never as predicted results of the program |

## 10. Open Questions

1. Pricing points for weekly vs. annual (needs competitor pricing pull + willingness-to-pay test).
2. Streak definition: does a scan alone count as a streak day, or only routine/workout completion?
3. Should Ratings history retain original photos indefinitely or auto-expire (privacy vs. before/after value)?
4. Avatar render provider and unit cost — affects whether credits tier the annual plan.

## Appendix A — Asset Register

| File | Role | Placement | Notes |
|---|---|---|---|
| `onboarding-flow-image1.png` | Capture good example ("Like this") | Step 5 capture screen, do/don't pair | Front-facing, even diffused light, average-looking model, dark warm background; matches generation prompt 1 |
| `capture-bad-example.png` | Capture bad example ("Too dark") | Step 5 capture screen, do/don't pair | Derived directly from `onboarding-flow-image1.png` (underexposed, side shadow, slight blur + noise) — identity match guaranteed, single-variable lesson: lighting. Replaces rejected `onboarding-image-2.png` (splice seam artifact, different model, lighting too flattering) |
| `onboarding-for-selfie-taking-asset.mp4` | Capture instruction loop | Step 5 capture screen, above viewport | 5.2s, 624×624, h264; model rotates front → full profile, demonstrating the two-angle sequence. Autoplay muted + looped; pause on prefers-reduced-motion |
| `onboarding-face-scan-image1-upscaled.jpg` | Welcome hero — static/fallback | Step 1 welcome screen only (sanctioned aspirational exception per DESIGN.md); also App Store screenshots | Full profile, warm golden-bronze grade, sharp jawline subject. 1080×1928 upscale of the original 720×1280. ⚠️ Tighter crop than the original and visible over-sharpening on skin/stubble — usable for design review; consider a gentler upscale pass before ship. Never place on capture, results, or paywall surfaces |
| `onboarding-face-scan-video.mp4` | Welcome hero — animated | Step 1 welcome screen, plays once on open then freezes on final profile frame (avoids loop snap-back) | ~6s, 400×736 — must be upscaled/regenerated at higher res. Same model and grade as the still. Muted, no controls; static still as prefers-reduced-motion and low-power fallback |

Pending generation: high-resolution welcome hero video (≥ 1080×1920 — still is now delivered at 1080×1928), profile-angle guide shot of the ordinary capture model (for the profile step), premium banner ornament masters (facial-geometry motif, on `#C99E6F` and `#241B12` — low priority until locked-Results and Pro-banner surfaces are built), app icon.
