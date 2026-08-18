# App Review response — submission b876a2fb-58e8-4bd9-b859-f7d5e1db03d2

Review date 2026-08-17, version 1.0 (27), reviewed on iPad Air 11-inch (M3).
Four items were raised. Two are fixed in the binary, one is an App Store Connect
metadata change, one is a written reply.

| Guideline | Type of fix | Status |
|---|---|---|
| 5.1.1(iv) — permission pre-prompt | Binary | Fixed in this build |
| 1.2 — objectifying content | Binary | Fixed in this build |
| 2.3.6 — Age Rating "In-App Controls" | App Store Connect metadata | **Owner action** |
| 2.1 — face data questions | Written reply | Draft below, **needs 3 blanks filled** |

---

## 1. Guideline 5.1.1(iv) — permission pre-prompt (fixed in binary)

`src/screens/onboarding/GuidedCaptureScreen.tsx`

- The custom pre-permission button no longer says "Allow camera". It says
  **"Continue"**, and the message above it is descriptive rather than
  instructional: "Your scan uses a front and profile photo of your own face."
- The user's decision is respected. If camera access was previously denied
  (`canAskAgain === false`) the screen no longer re-asks: it explains that the
  scan cannot take a photo without the camera, offers **"Open Settings"**
  (`Linking.openSettings()`), and points to the gallery button so an existing
  selfie can be used instead. The system permission alert is the only thing that
  ever asks for the grant.
- The purpose string in `app.json` is unchanged and still explains the use:
  "Axend uses your camera to capture the front and profile photos used to
  generate your trait scores."

## 2. Guideline 1.2 — content that could read as objectifying (fixed in binary)

Axend analyzes only the photo of the person using the app, and only to build
that person's own grooming and exercise routine. Changes in this build remove
the surfaces that could read as rating a person:

- **No percentage ratings anywhere.** The locked/blurred results grid rendered
  raw values as "72%", "61%", "47%" — the screen in the review screenshot. Ring
  gauges now render the personal 0–10 score (`scoreLabel`), and the raw
  `percentile` field is internal data that no longer has any path to the screen
  (`RingGauge.tsx`, `BlurredTraitGrid.tsx`).
- **No ranking against other people.** Already removed in the previous build for
  1.1.1 and re-verified: no "Top X%", no "of men", no rank tiers. Scores are a
  personal baseline plus a descriptive band ("Focus area", "Developing",
  "Solid", "Strong") and change over time.
- **Self-use is stated at the point of capture.** "Use your own face — Axend only
  analyzes photos of the person using it."
- **"Ratings" tab renamed "Progress"**; "Re-rate now" is now "Start a new scan";
  "your percentiles updated" is now "your scores updated".
- **Clinical/appraising analysis copy softened.** The scan progress steps were
  "Measuring proportions" / "Checking symmetry"; they are now "Checking photo
  quality", "Reading lighting and angle", "Looking at skin and hair", "Matching
  your selected concerns", "Building your baseline", "Preparing your plan".
- **Concern label** "Attractive smile" is now "Confident smile".
- There is no user-generated content: no feed, no profiles, no comments, no
  uploads visible to anyone else. Nothing in the app can be pointed at another
  person, and no content from one user is ever shown to another.

## 3. Guideline 2.3.6 — Age Rating "In-App Controls" (App Store Connect)

The app has no parental controls and no age-assurance mechanism. Its only age
handling is a self-declared 17+ gate on the first onboarding screen ("How old
are you?", with an "Axend is for ages 17 and up" stop screen for under-17), which
is not age assurance in Apple's sense.

**Action:** App Store Connect → the app → App Information → Age Rating → Edit →
set **"Age Assurance" to "None"** (and leave Parental Controls unselected).
No binary change is required.

## 4. Guideline 2.1 — face data (reply to paste into App Store Connect)

> **What face data does the app collect?**
>
> Axend collects photographs only: one front-facing selfie, and optionally one
> profile selfie, either captured in-app with the user's camera or chosen by the
> user from their photo library. It does not create or store a faceprint,
> face template, face embedding, or any other biometric identifier; it does not
> perform face recognition, face matching, or face identification; it does not
> use ARKit face tracking, TrueDepth data, or Face ID data; and it never attempts
> to determine who the person in the photo is. The only thing derived from a
> photo is a set of seven non-identifying numeric scores (jawline, cheekbones,
> skin, hair, masculinity, smile, eyes) used to build the user's grooming and
> exercise plan.
>
> **Complete explanation of use, sharing, retention, deletion and storage.**
>
> When the user taps to run a scan, the app requests single-use signed upload
> URLs from our API and uploads the photo(s) over HTTPS directly to our cloud
> storage. Our scoring service reads the photos once, sends them to our AI
> inference provider to produce the seven trait scores, returns those scores to
> the device, and then deletes both photos from our storage. The photos are not
> retained on our servers after scoring, are not used to train any model, are
> not sold, and are not used for advertising or tracking. The scores themselves
> are stored only on the user's device. The photo the user sees in the app is the
> local copy on their device; the user can delete it at any time under
> Profile → Privacy → "Delete my photos", and Profile → "Delete all my data"
> additionally calls our API's account-deletion endpoint and clears all local
> data. Uninstalling the app removes the local copies.
>
> **Will face data be shared with any third parties? Where is it stored?**
>
> Photos are processed by two categories of processor acting on our
> instructions under written data-processing terms: our cloud hosting/storage
> provider (<HOSTING_PROVIDER>, data stored in <REGION>) and our AI inference
> provider (<AI_PROVIDER>), which processes the image to return scores and does
> not retain it or use it for training. No other third party receives photos. In
> particular RevenueCat, our subscription provider, receives only an anonymous
> app user ID and purchase/entitlement data — never photos or scores. Photos are
> never shared with other users; the app has no social or user-generated-content
> features.
>
> **How long will face data be retained?**
>
> On our servers: only for the duration of the scan request — both photos are
> deleted immediately after scoring completes. On the user's device: until the
> user deletes them in Profile → Privacy → "Delete my photos" or
> Profile → "Delete all my data", or uninstalls the app.
>
> **Where in the privacy policy is this explained?**
>
> Privacy policy: https://balkanbit.app/axend/privacy-policy — Section 2 ("What
> the App does with your photos"), Section 5 ("Service providers"), Section 6
> ("Retention") and Section 7 ("Your rights").
>
> **Quoted text from the privacy policy concerning face data.**
>
> Section 2, "What the App does with your photos": "Photos are stored locally on
> your device. You can delete them at any time in Profile → Privacy → Delete my
> photos." — "When you run a scan, your photos are uploaded over encrypted HTTPS
> connections using single-use, signed upload links to our secure cloud storage."
> — "Our scoring service analyzes the photos with an AI model to produce your
> trait scores, and deletes both photos from our servers immediately after
> scoring." — "Your photos are never used to identify you, sold, shared for
> advertising, or used to train AI models."
>
> Section 6, "Retention": "Photos on our servers — deleted immediately after
> scoring; generated avatar images expire automatically." — "Photos, scores, and
> answers on your device — kept until you delete them in the App or uninstall the
> App."
>
> Section 5, "Service providers" lists RevenueCat, Inc., cloud hosting and
> storage providers, the AI inference provider, and Apple App Store / Google Play.
>
> Section 7, "Your rights" covers erasure ("right to be forgotten").

### Blanks to fill before sending

1. `<HOSTING_PROVIDER>` — the actual storage vendor behind the signed upload URLs.
2. `<REGION>` — where that bucket lives (e.g. "the EU (Frankfurt)").
3. `<AI_PROVIDER>` — the inference vendor the scoring service calls, and
   confirmation that its terms exclude training on submitted images.

If any of these are named in the reply they should also be named (or at least
matched in category) in Section 5 of the privacy policy.
