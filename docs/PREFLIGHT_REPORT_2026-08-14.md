# App Store Preflight Re-scan — Axend (com.balkanbit.looxmaxxing)

**Date:** 2026-08-14 · **Apple ID** 6788362935 · Supersedes `PREFLIGHT_REPORT_2026-08-13.md`
**Skill:** `app-store-preflight-skills` v1.0
**Method:** App Store Connect inspected live in the browser; repo checked at branch `chore/regenerate-app-store-screenshots`.

**Version status: still `1.0 Rejected`.** The rejection banner is unchanged — *"1.1.1 Safety: Objectionable Content"*. Nothing has been resubmitted, and no new build has been uploaded. The rejected binary is still 1.0 (24), which predates every fix below.

---

## ❌ Blockers (4)

### 1. [1.1.1] The live listing still shows the rejected framing
The fixes exist in the repo but **have not been uploaded**. The 6.5" slot reads "Using 6.9" Display", and the six screenshots serving from the 6.9" slot are still the originals: *"How hot are you, really?"*, *"Every trait. Rated."*, *"The plan that moves the number."* A reviewer opening the listing today sees exactly what was rejected.

- Fix: upload `docs/app-store-screenshots/en-US-6.9in/` (6 × 1320×2868). Manual — the upload tool is broken.

### 2. [2.1] App Preview slot is empty — 0 of 3
I deleted the original preview video in error while removing screenshots. The replacement is built and verified but not uploaded.

- Fix: upload `docs/app-store-screenshots/preview/axend-preview-6.9.mp4` (886×1920, SAR 1:1, 28.23s, 19 MB).

### 3. [1.5] Support URL is the privacy policy
Still `https://balkanbit.app/axend/privacy-policy` — verified live in the version metadata just now. A support URL must offer a contact method.

- The page now exists (`balkanbit` PR #1, `/axend/support`, build-verified) but is **not deployed**. Deploy first, then repoint the field. Setting it before deploy would point at a 404.

### 4. [5.1.1 / 5.1.2] Privacy manifest contradicts the App Privacy label
Verified live: the label declares **Data Linked to You** (Identifiers, Purchases) and **Data Not Linked to You** (User Content), with **no "Data Used to Track You" section at all**. The repo now ships `NSPrivacyTracking: true` with 3 tracking domains and an ATT prompt. Apple cross-checks these; they cannot both be right.

- Decide one: **(a)** keep AppsFlyer attribution → add Device ID under "Data Used to Track You" in the label; or **(b)** drop tracking → set `NSPrivacyTracking: false`, remove the domains, disable IDFA in AppsFlyer, revert the ATT request.
- Unchanged from the last scan because it needs your decision, not code.

---

## ⚠️ Warnings (2)

### 5. [2.1] Review notes still incomplete
Current notes cover sign-in and testing only. Of the six required sections, missing: **physical-device screen recording**, **external services list** (RevenueCat, AppsFlyer, `looxmaxxing-api.vercel.app`), and **regional differences**.

Given the rejection history, the notes should also state plainly what changed: scores are now a personal 0-10 baseline, there is no ranking against other people, and the rank-tier goals are gone.

### 6. [2.1] `NSPrivacyTrackingDomains` unverified
Only 3 hostnames, taken from the installed SDK because AppsFlyer's docs were unreachable. Confirm against their current guidance — but moot if you choose (b) above.

---

## ✅ Resolved since 2026-08-13 (7)

| Area | Evidence |
|---|---|
| **[1.1.1] In-app ranking removed** | No `of men` / `Top X%` / `topPercentLabel` anywhere in `src/` (only an explanatory code comment). Scores present as `scoreOutOfTen()` + `bandLabel()`. |
| **[1.1.1] Rank-tier goals removed** | `GoalLevelScreen` now offers effort levels ("Keep it simple" … "All in"); `GoalLevel` keys unchanged so stored state stays valid. |
| **[1.1.1] Marketing copy** | Composed screenshot copy clean; a build guard now fails the run on `of men`, `Top N%`, `how hot`, `honest rating`. The hero was hand-composed HTML and had survived the app reframe — caught and fixed. |
| **[2.3.1] Store metadata** | Verified live: name *Axend: Grooming & Self-Care*, keywords `skincare,grooming,…` (no `mog`), description contains no ranking language. |
| **[3.1.2] Paywall pricing** | Billed amount is now the prominent element; per-week subordinate. |
| **[2.3.1] Fabricated testimonials** | `RatingScreen` deleted. |
| **[2.3.1] App name** | `expo.name` → `Axend`; `CFBundleDisplayName` no longer reads `looxmaxxing`. |

Assets built and verified: `en-US` 6 × 1242×2688, `en-US-6.9in` 6 × 1320×2868, preview 886×1920 SAR 1:1.

---

## Ordered path to resubmission

1. **Deploy balkanbit** → repoint Support URL to `/axend/support`. *(blocker 3)*
2. **Decide tracking** → align manifest and label. *(blocker 4)*
3. **Upload** 6 screenshots + preview video. *(blockers 1, 2)*
4. **Write review notes**, all 6 sections, stating the 1.1.1 remediation.
5. **EAS build + upload a new binary** — the rejected 1.0 (24) contains none of this work.
6. Resubmit.

Steps 1-4 are independent and can run in parallel; step 5 gates the submission.
