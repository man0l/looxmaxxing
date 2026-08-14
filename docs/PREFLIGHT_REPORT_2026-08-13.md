# App Store Preflight Report — Axend (com.balkanbit.looxmaxxing)

**Date:** 2026-08-13
**Skill:** `app-store-preflight-skills` v1.0 (`~/.agents/skills/`)
**Checklists applied:** `all_apps`, `subscription_iap`, `ai_apps`, `health_fitness`, `social_ugc`
**App Store Connect:** Apple ID 6788362935 — inspected live in the browser.

---

## ⛔ The actual blocker: version 1.0 was REJECTED

Apple rejected build **1.0 (24)** on **2026-08-05** (submitted Jul 25, reviewed on iPad Air 11-inch M3). Submission ID `b876a2fb-58e8-4bd9-b859-f7d5e1db03d2`.

> **Guideline 1.1.1 — Safety — Objectionable Content**
>
> *Issue Description:* The app includes content that could be considered defamatory or mean-spirited. Specifically, the app focuses on looks. Content that is likely to humiliate, intimidate, or harm a targeted individual or group is not appropriate for the App Store.
>
> *Next Steps:* To resolve this issue, please remove all potentially defamatory and mean-spirited content from the app and **submit your revised binary for review**.

The three subscriptions and the subscription group show "Rejected" only as collateral — they cannot be approved while the version is rejected. There is no separate subscription finding.

**This is a premise-level rejection, and Apple asked for a revised binary.** Metadata alone will not clear it.

---

## ✅ Fixed in this session

### App Store Connect (saved, verified after reload)

| Field | Before | After |
|---|---|---|
| Name | Axend: Face Analysis **Beauty** | **Axend: Grooming & Self-Care** |
| Subtitle | Trait scores & daily plans | Daily routines & progress |
| Promo text | "Your AI looksmax coach: get a **face rating**… **boost your rating**" | "Build a grooming routine that actually sticks…" |
| Keywords | `looksmax,mewing,**mog**,…,rating,…,attractive` | `skincare,grooming,jawline,mewing,routine,habits,self care,streak,men,progress` |
| Description | "an **honest face rating**", "your **weakest areas**", "watch your **rating climb**" | Routine/plan framing + explicit cosmetic-not-medical disclosure + Terms **and** Privacy Policy links |

`mog` (looksmaxxing slang for out-ranking someone on looks) and "How hot are you, really?" were the strongest 1.1.1 signals in the listing.

### Repo

- **Paywall pricing (3.1.2)** — the annual card showed the derived per-week price at 22px/700 and the real charge at 11px tertiary. Swapped: billed amount is now primary, per-week subordinate. [PaywallScreen.tsx:166](src/screens/PaywallScreen.tsx:166). Also fixed the `$49.99/year` fallback that would have rendered "/year/year".
- **Fabricated testimonials (2.3.1)** — deleted `RatingScreen.tsx` (two invented 5-star reviews with handles, one claiming "Top 60% → Top 34%") and removed the step from `OnboardingNavigator`. Progress bar sequencing unaffected.
- **ATT (5.1.2)** — added `expo-tracking-transparency`, `NSUserTrackingUsageDescription`, and an actual authorization request before `initSdk` in [appsflyer.ts](src/services/appsflyer.ts). Previously `timeToWaitForATTUserAuthorization: 10` waited for a prompt that never appeared.
- **Privacy manifest (5.1.1)** — added `ios.privacyManifests` to `app.json` (Expo SDK 56 generates `PrivacyInfo.xcprivacy`; `/ios` is gitignored so this had to go through app config).
- **App name (2.3.1)** — `expo.name` → `Axend`, so `CFBundleDisplayName` stops saying `looxmaxxing` while every permission dialog says Axend.
- **Motion purpose string** — replaced the `$(PRODUCT_NAME)` boilerplate with a specific description.
- **Accuracy disclosure (1.4.1)** — new "What this is not" card in Methodology and a footnote on Results: cosmetic estimates, not a medical assessment, individual results vary.
- **Screenshot captions** — rewrote all six in [capture-and-compose.mjs:39](scripts/app-store-screenshots/capture-and-compose.mjs:39). "How hot are you, really?" → "Your face, your plan."; "Every trait. Rated." → "Every area, one routine."; eyebrow "THE HONEST FACE RATING" → "YOUR GROOMING PLAN"; the "Top 54% → Top 45%" pill → "Track change over 2 weeks".

`npx tsc --noEmit` and `npx expo lint` both clean. `npx expo config --type prebuild` confirms name `Axend`, ATT string present, `NSPrivacyTracking: true`, 4 accessed-API types, 4 collected-data types.

---

## ❗ Open — needs your decision

### 1. Privacy manifest contradicts the App Privacy label
The nutrition label (verified live) declares **Device ID, Photos or Videos, Purchase History — all "App Functionality", nothing marked "Used for Tracking"**, and there is no "Data Used to Track You" section. I just declared `NSPrivacyTracking: true` with Device ID tracking. Apple cross-checks these. Pick one:

- **Keep attribution** → update the nutrition label to add Device ID under "Data Used to Track You" (Third-Party/Developer Advertising). The ATT prompt I added is then correct.
- **Drop tracking** → set `NSPrivacyTracking: false`, remove `NSPrivacyTrackingDomains`, disable IDFA in AppsFlyer, and revert the ATT request.

I did not change the label — it's a legal declaration and depends on your AppsFlyer configuration, which I can't see.

### 2. `NSPrivacyTrackingDomains` is incomplete
I could not reach AppsFlyer's docs (their endpoints 404/403), so I listed only the three hostnames verifiable from the installed SDK: `launches.appsflyer.com`, `conversions.appsflyersdk.com`, `onelink.me`. Confirm the full list against AppsFlyer's current privacy-manifest guidance before submitting — I did not want to guess into a compliance file.

### 3. Support URL is a privacy policy (Guideline 1.5)
Set to `https://balkanbit.app/axend/privacy-policy`. I verified live: `/axend/privacy-policy` → 200, `/axend/terms` → 200, but **`/axend/support`, `/axend`, and `/axend/contact` all 404**. You need a real support page with a contact method. I left the field alone rather than point it at a 404.

### 4. Screenshots still need regenerating and re-uploading
The captions are fixed in the repo script, but the six live PNGs on the listing still say "How hot are you, really?". Re-run the capture script and upload. This is the single most visible 1.1.1 asset.

### 5. ~~The binary still ranks users against other people~~ — RESOLVED
The app reported "Top 39% **of men**" throughout Results, TraitGrid, share cards, Ratings, and Avatars, and asked users to pick a rank tier ("Top 1% of men") as a goal. All interpersonal comparison is now removed: scores present as a personal baseline (`scoreOutOfTen()` → "6.1 / 10") plus a descriptive, self-referential `bandLabel()` ("Solid", "Focus area"), with change over time as the progress signal. `topPercentLabel()` is deleted; the `percentile` field remains internal data only.

Screenshots and the preview video were regenerated against the reframed UI, so the app, the assets, and the store copy now agree. The guardrail in `AGENTS.md` and `CLAUDE.md` previously mandated "percentile framing only" — the framing that caused the rejection — and has been rewritten to forbid ranking.

---

## ⚠️ Still open from the original scan

- **[2.1] Review notes** — the existing notes cover sign-in and testing but not all 6 required sections. Missing: physical-device screen recording, external services list (RevenueCat, AppsFlyer, `looxmaxxing-api.vercel.app`), and regional differences. Template in the skill at `references/rules/metadata/review_notes_template.md`.
- **[2.1] Backend must stay live** through review; `services/scoring.ts` still holds `MOCK_PERCENTILES` as a fallback.
- **[5] China storefront** — no banned AI brand names anywhere in the codebase, but the app does server-side AI scoring. Check whether China mainland is in your availability list.

## ✅ Verified correct in App Store Connect

Age rating 18+ (173 regions, Brazil 18+, Korea 19+) · Category Lifestyle / Health & Fitness · Content Rights declared · Apple Standard License Agreement · Privacy Policy URL set · App Privacy label completed (contrary to the older checklist doc, which is now stale on this point) · empty entitlements file · ATS and `ITSAppUsesNonExemptEncryption` set · paywall has Terms, Privacy, Restore, and an auto-renewal disclosure.
