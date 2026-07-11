# App Store / Beta App Review Checklist — Axend

Audit date: 2026-07-11. Scope: build 1.0.0 (7), currently "Waiting for Review" for external TestFlight Beta App Review.

## Confirmed gaps found in this audit

These were checked directly against the codebase and the live App Store Connect record — not generic advice.

### 1. Privacy Policy URL missing in App Store Connect — HIGH RISK
`Distribution → App Privacy → Privacy Policy URL` is empty ("–") in App Store Connect, even though the app has a real, live, well-written privacy policy at `https://balkanbit.app/axend/privacy-policy` (confirmed reachable, GDPR-aware, explains face-photo handling/deletion). The field just was never filled in on the ASC side. This is the single most-cited cause of Guideline 5.1.1 rejections.
**Fix:** ASC → App Privacy → Edit → paste the URL → Publish.

### 2. App Privacy "nutrition label" questionnaire not started — HIGH RISK
Same page shows "Get Started" — the data-collection questionnaire (what categories of data you collect: photos, purchase data, identifiers) has never been filled out. Apple checks this against the actual binary/SDKs and rejects apps with missing or inaccurate answers.
**Fix:** Walk through "Get Started." Based on the privacy policy and code audit, you'll declare: Photos (linked to user, used for app functionality, not used for tracking), Purchase History (via RevenueCat), and no Identifiers/Contact Info/Location.

### 3. No auto-renewal disclosure text on the paywall screen itself — HIGH RISK
`src/screens/PaywallScreen.tsx` shows price and billing period per plan, plus Terms/Privacy links and a Restore Purchases button — but the actual auto-renewal disclosure sentence ("Subscription automatically renews unless cancelled at least 24 hours before the end of the current period...") only lives on the external Terms of Use page, not on the purchase screen itself. Guideline 3.1.2 requires this text to be visible at the point of purchase, not one tap away.
**Fix:** Add a short disclosure line (can be small print) near the CTA button, e.g. "Auto-renews for {price}/{period}. Cancel anytime in Settings." with the full legal text still linked via Terms.

### 4. Under-17 age-gate path is a silent no-op — MEDIUM RISK
`src/navigation/OnboardingNavigator.tsx`: selecting "Under 17" on the age gate and pressing Continue does nothing (`onUnder17={() => {}}`, and the continue handler just `return`s). Functionally it blocks progression, but a reviewer will see a button that appears broken with no feedback message — a plausible Guideline 2.1 (App Completeness) flag.
**Fix:** Show an explicit "You must be 17+ to use Axend" screen/message on that path instead of a silent no-op.

### 5. Age Rating not configured in App Store Connect — LOW RISK for beta, blocks full submission
`App Information → Age Ratings` shows "Set Up Age Ratings" (unconfigured). Not a hard blocker for external TestFlight beta review specifically, but must be done before the app can go to full App Store review.

### 6. Category and Content Rights not set — LOW RISK for beta, blocks full submission
`App Information`: Primary/Secondary Category dropdowns are empty, and "Content Rights Information" is unconfigured. Same as above — needed before full submission, not currently blocking TestFlight.

## What's already solid (verified, not assumed)

- Privacy Policy and Terms of Use pages are live, specific, and mention the 17+ age gate, face-photo retention/deletion, and GDPR rights.
- Restore Purchases is present on both the Paywall and Profile screens.
- No third-party analytics/ad/tracking SDKs in `package.json` — no App Tracking Transparency prompt needed, minimal Privacy Manifest surface.
- `ITSAppUsesNonExemptEncryption: false` already set in `app.json` — export compliance question won't block submission.
- Purchases go through native StoreKit/RevenueCat only — no external payment links (Guideline 3.1.1 clean).
- Build 7's Binary State is "Validated" with no automated compliance flags; it's a clean upload sitting in the human review queue.

## General pre-submission checklist (for future builds/versions)

Compiled from Apple's official App Review Guidelines and current third-party rejection-pattern write-ups.

**Completeness & stability (Guideline 2.1)** — cited as the single largest rejection bucket: app must not crash, all links/buttons must work, no placeholder/Lorem ipsum content, no dead-end screens.

**Privacy (Guideline 5.1.1)** — Privacy Policy URL set in ASC; policy actually describes what's collected; App Privacy questionnaire answers match real data practices; any third-party SDK's data use is disclosed too.

**Subscriptions (Guideline 3.1.2)** — on the purchase screen itself: title, duration, price, and auto-renewal terms all visible; functional links to Privacy Policy and Terms of Use; a working Restore Purchases action; no way to accidentally double-subscribe to the same entitlement.

**Payments (Guideline 3.1.1)** — all digital goods/subscriptions purchased through Apple's IAP, no mention of cheaper pricing elsewhere, no external payment links for digital content.

**Metadata** — no keyword-stuffed subtitle/keywords field, no competitor names, screenshots reflect real app UI (no mockup chrome or fake device bezels claiming features that don't exist).

**Demo access** — if any login/account gate exists, provide working demo credentials in App Review Information; not applicable here since Axend has no accounts (anonymous RevenueCat ID only).

**Privacy Manifests** — every bundled third-party SDK needs a privacy manifest; Apple's scanner detects SDKs in the binary even if undisclosed.

**Sensitive content framing** — for appearance/beauty-scoring apps specifically: avoid diagnostic/medical claims, avoid shame or verdict language, keep percentile/estimate framing (already required by this project's design guardrails in `CLAUDE.md`) — this reduces risk under Apple's broader "objectionable content" and app-quality scrutiny even though there's no single numbered guideline that names this category directly.

## Sources

- [App Review Guidelines — Apple Developer](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Store Rejection Guide 2026 — OpenSpace Services](https://www.openspaceservices.com/blog/mobile-app-development/apple-app-store-rejection-guide-2026-the-15-most-common-reasons-and-how-to-fix-each)
- [Auto-renewable subscription information — App Store Connect Help](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/auto-renewable-subscription-information/)
- [Offer auto-renewable subscriptions — App Store Connect Help](https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions/)
- [App Review Rejection guideline 3.1.2, ongoing value — RevenueCat Community](https://community.revenuecat.com/general-questions-7/app-review-rejection-guideline-3-1-2-ongoing-value-6617)
- [Fix Apple Rejection: App Store Guideline 5.1.1 Privacy Issues](https://shopapper.com/fix-apple-rejection-app-store-guideline-5-1-1-privacy-issues/)
- [How to Resolve App Store Guideline 5.1.1 — BuddyBoss](https://buddyboss.com/docs/app-store-guideline-5-1-1-legal-privacy-data-collection-and-storage/)
- [TestFlight Beta Testing: The Complete Guide for iOS Developers](https://iossubmissionguide.com/testflight-beta-testing-complete-guide/)
