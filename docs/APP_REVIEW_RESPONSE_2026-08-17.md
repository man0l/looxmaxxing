# App Review response — submission b876a2fb-58e8-4bd9-b859-f7d5e1db03d2

Rejection received 2026-08-17 against version 1.0 (27), reviewed on iPad Air 11-inch (M3).
Four items were raised: 5.1.1(iv), 2.3.6, 1.2 and a 2.1 information request.

This document holds (a) what changed in the binary and (b) the metadata changes that must be made
in App Store Connect by hand. It is written for us, not for Apple — do not paste it into the
Resolution Center.

**The message to actually send is `RESOLUTION_CENTER_REPLY.md`**, a single paste-ready block
covering all four items.

---

## 1. Guideline 5.1.1(iv) — camera permission pre-prompt

**What Apple objected to:** the pre-permission screen used a button labelled "Allow camera",
which directs the user toward granting the permission.

**Changed in the binary** (`src/screens/onboarding/GuidedCaptureScreen.tsx`):

- The button is now labelled **"Continue"**. Nothing in the app asks the user to allow anything.
- The supporting line no longer instructs. It was
  *"Allow camera access to take your photo."* and is now
  *"Axend uses the camera to take the front photo your scores are read from."* — it states the
  purpose and leaves the decision to the system prompt.
- If the user has already declined and iOS will no longer show its prompt
  (`canAskAgain === false`), the screen no longer offers a dead button. It explains that camera
  access is off, points out that the photo library still works, and offers **"Open Settings"**
  which deep-links via `Linking.openSettings()`. This is the fallback Apple's own guidance
  suggests for a feature that cannot function without the permission.
- The shutter button follows the same rule — it routes to Settings when the permission is
  permanently denied instead of silently calling a no-op `requestPermission()`.

The photo library remains a first-class alternative on the same screen, so declining the camera
never dead-ends the flow.

---

## 2. Guideline 1.2 — features that appear to objectify real people

Version 1.0 was previously rejected under 1.1.1 for ranking a user's face against other people;
the visible "Top X% of men" label was removed then. This round we removed the remaining surfaces
where the app treated a real person as something to be rated.

**Changed in the binary:**

- **Shareable score cards no longer contain a face.**
  (`src/components/share/ShareCards.tsx`) The card previously paired the user's photo with their
  appearance scores and was shareable to Instagram Stories, X, TikTok and WhatsApp — a real
  person's face captioned with appearance ratings, distributed outside the app. The photo is
  gone. The card now shows only the user's own progress against their own earlier baseline
  ("My baseline · 5.5 / 10", "Tracking my own progress with Axend") with no identifying content.
  The `photoUri` prop was deleted from the component so it cannot be reintroduced by accident,
  and the share caption changed from "My axend scan" to "My Axend progress".

- **The scoring model no longer compares the user to other people.**
  (`looxmaxxing-api`, `src/services/scoring.js`) The system prompt still asked the model to
  estimate *"how he compares to other adult men"*. That interpersonal ranking was the substance
  behind the earlier rejection and it contradicted the app's own methodology screen, which tells
  users the score "is your own starting point, not a ranking against other people". The prompt
  now asks for an absolute, descriptive rating of the named structural feature only, and
  explicitly forbids ranking against other people, rating overall attractiveness or
  desirability, and rating the person rather than the feature.

- **The "Masculinity" trait is now labelled "Presence".**
  (`src/types/traits.ts`, and the concern, paywall, depth-question and methodology copy) The
  trait's plan has always been the Posture workout and its avatar preview has always read
  "Stronger presence" — the score describes posture and bearing. Presenting it as a score for how
  masculine a person is went beyond what it measures and read as rating the person rather than a
  feature. The underlying trait id is unchanged, so existing scans keep working, and the scoring
  prompt now explicitly scopes that id to presence and forbids rating how masculine or feminine
  the person is.

- **Scans are stated to be self-only, at the point of capture.**
  (`src/screens/onboarding/GuidedCaptureScreen.tsx`) The Terms of Use already require that "You
  may only submit photos of yourself"; that rule is now visible in the app where it matters. The
  capture screen reads *"A photo of you — face the camera, fill the oval, even lighting"* and
  *"Scan your own face only."*

Scores were already framed as a personal baseline rather than a verdict, the methodology screen
already states the app never judges identity, ethnicity or worth, and no feature in the app lets
a user rate, rank, browse or comment on another person — there is no social graph, no feed, no
accounts, and no user-to-user content of any kind.

---

## 3. Guideline 2.3.6 — In-App Controls / Age Assurance

**The app does contain an age assurance mechanism.** It is a self-declared age gate that blocks
users under 17 from the app entirely.

Where to find it, for the reply to Apple:

1. Launch the app → tap **"Scan my face"** on the welcome screen.
2. **Step 2 of onboarding: "How old are you?"** — the user must pick an age band before they can
   go any further.
3. Selecting **"Under 17"** shows the **"Axend is for ages 17 and up"** screen and the onboarding
   flow stops there. There is no path past it.
4. After onboarding, the declaration is visible and changeable at
   **Profile → Age → Minimum age (17+) / Your age range / Change age range**.

**Strengthened in this build:**

- The declared age now survives a relaunch. Previously, force-quitting on the ineligible screen
  and reopening the app restarted onboarding at the welcome screen, which let a user walk past
  the gate. The under-17 answer is persisted and re-applied on launch
  (`src/navigation/OnboardingNavigator.tsx`).
- The age gate is now reachable from **Profile → Age**, so it can be located without reinstalling
  the app (`src/screens/ProfileScreen.tsx`). Re-declaring an age under 17 there sends the user
  back through the gate.
- The eligible bands now start at 17. The options were "Under 17" then "18–24", which left a
  17-year-old — who *is* eligible for a 17+ app — with no truthful answer. The band is now
  "17–24" (`src/screens/onboarding/AgeGateScreen.tsx`).

### Decision needed in App Store Connect

Apple offers two routes. Pick one:

- **Route A (recommended) — keep the declaration and tell Apple where it is.** The mechanism is a
  self-declared age gate, which is what the "Age Assurance" content description covers. Reply
  with the four location steps above. No metadata change.
- **Route B — set it to "None".** App Store Connect → the app → **App Information** → **Age
  Rating** → Edit → set **"Age Assurance"** to **None** → Save. Choose this if you would rather
  not defend a self-declared gate as an assurance mechanism; the gate stays in the app either
  way.

Do not claim Parental Controls. The app has none, and none were added.

---

## 4. Guideline 2.1 — information request about face data

Answers below are drawn from the shipped code and the live privacy policy at
<https://balkanbit.app/axend/privacy-policy> (effective 3 July 2026). Each answer is accurate as
of build 1.0 (27) — the retention claims were re-verified against
`looxmaxxing-api/src/controllers/scansController.js` while preparing this response.

### Q1. What face data does the app collect?

Two ordinary photographs of the user's own face: a front photo, and an optional profile photo.
They are captured with the device camera or chosen from the photo library, at the user's explicit
action, one scan at a time.

The app does **not** create, derive or store a faceprint, face template, face geometry map,
face embedding, face signature or any other biometric identifier. It does not use ARKit face
tracking, `Vision` face-identity APIs, `LocalAuthentication`, or any face-recognition SDK. No
face data is ever used to identify, authenticate or re-identify anyone, and no data derived from
a face is retained after a scan.

What is retained is the output: seven integers (0–100), one per cosmetic trait — jawline,
cheekbones, skin, hair, presence and posture, smile, eye area. Those integers are stored **only on
the user's own device**.

### Q2. Planned use, sharing, retention, deletion and storage of the collected face data

**Use.** Solely to compute the seven trait scores shown to that user, and — if the user opens the
optional Avatars feature — to generate a stylized preview image of their own photo. Nothing else.
Face photos are never used for identification, authentication, advertising, profiling, analytics,
model training, or any purpose beyond returning the user's own result to that same user.

**Storage.** The photos live in the app's own sandboxed storage on the user's device. During a
scan the photo is uploaded over HTTPS/TLS to our cloud storage using a **single-use, signed
upload URL**, held only in the ephemeral scan inbox, and downloaded into memory by the scoring
service.

**Retention.** The server-side copy is deleted **immediately after scoring**, in the same
request. In code this is a `finally` block, so the delete runs whether scoring succeeded or
failed — a failed scan does not leave a photo behind. Only the numeric scores are returned to the
device. Generated avatar images are served from a temporary signed link that expires
automatically. No face photo is retained on our servers after the request that produced it.

**Deletion.** The on-device copies are deleted by the user at any time via **Profile → Privacy →
Delete my photos**, or **Profile → Privacy → Delete all my data**, or by uninstalling the app.
"Delete all my data" also calls our `DELETE /v1/user-data` endpoint to clear anything associated
with the anonymous identifier.

**Sharing.** Face photos are never sold, never shared for advertising, and never disclosed to
anyone except the transient processing described in Q3.

### Q3. Will the face data be shared with any third parties? Where will this information be stored?

Face photos are disclosed to exactly two categories of processor, both bound by data processing
agreements, and in both cases transiently:

1. **Our cloud hosting and storage provider**, which holds the photo in the single-use signed
   upload slot for the seconds between upload and scoring, after which it is deleted.
2. **Our AI inference provider (OpenAI)**, which receives the photo in the scoring request,
   returns the trait scores, and does not retain the photo or use it for model training.

No other third party receives face data. In particular, our subscription processor (RevenueCat)
receives only an anonymous identifier and purchase status — never photos. The app contains no
advertising SDKs and no third-party analytics SDKs, and does not track users across other
companies' apps or websites.

Where a processor operates outside the European Economic Area, transfers are covered by the
European Commission's Standard Contractual Clauses or an adequacy decision, including the EU–US
Data Privacy Framework where applicable.

The data controller is "Pazaruvai Umno" EOOD, UIC 206373314, Sofia, Bulgaria.

### Q4. How long will face data be retained?

- **On our servers:** not retained. Deleted immediately after scoring, within the same request.
- **On the user's device:** until the user deletes the photos in the app or uninstalls the app.
  The user controls this entirely.
- **Generated avatar images:** served from a temporary signed link that expires automatically.

### Q5. Where in the privacy policy is this explained?

<https://balkanbit.app/axend/privacy-policy>

- **Section 2 — "What the App does with your photos"**: collection, upload, processing, immediate
  server-side deletion, and the prohibition on identification, sale, advertising and model
  training.
- **Section 3 — "Categories of data we process"**, first bullet, "Face photos".
- **Section 4 — "Lawful bases for processing"**, first bullet: explicit consent under Art. 6(1)(a)
  and Art. 9(2)(a) GDPR, the special-category basis for biometric-adjacent data.
- **Section 5 — "Service providers"**: the cloud storage and AI inference processors, and the
  international transfer safeguards.
- **Section 6 — "Retention"**, first bullet: server-side photo retention.
- **Section 7 — "Your rights"**: access, rectification, restriction, withdrawal of consent, and
  erasure, plus how to exercise them.
- **Section 9 — "Security"**: TLS in transit, single-use signed URLs, access-controlled and
  short-lived server-side storage.

### Q6. Quote the specific text from the privacy policy concerning face data

From **Section 2, "What the App does with your photos"**:

> "Axend generates appearance trait scores from two photos of your face (a front photo and a
> profile photo) that you capture with your camera or select from your photo library. Because
> your face is sensitive data, we designed the App to handle photos as minimally as possible:"

> "Photos are stored locally on your device. You can delete them at any time in Profile → Privacy
> → Delete my photos."

> "When you run a scan, your photos are uploaded over encrypted HTTPS connections using
> single-use, signed upload links to our secure cloud storage."

> "Our scoring service analyzes the photos with an AI model to produce your trait scores, and
> deletes both photos from our servers immediately after scoring. Only the numeric scores are
> returned to your device."

> "If you use the avatar feature, your reference photo is uploaded the same way to generate a
> stylized image; the generated image is served from a temporary link that expires
> automatically."

> "Your photos are never used to identify you, sold, shared for advertising, or used to train AI
> models."

From **Section 3, "Categories of data we process"**:

> "Face photos — front and profile photos, processed transiently as described in Section 2."

From **Section 4, "Lawful bases for processing"**:

> "Consent (Art. 6(1)(a) and Art. 9(2)(a) GDPR) — for capturing and processing your face photos.
> You grant camera and photo library access through the operating system prompts, and each scan
> is started only by your explicit action. You may withdraw consent at any time by deleting your
> photos and not running further scans."

From **Section 6, "Retention"**:

> "Photos on our servers — deleted immediately after scoring; generated avatar images expire
> automatically."

From **Section 9, "Security"**:

> "All data in transit is encrypted with HTTPS/TLS. Photo uploads use single-use signed URLs,
> server-side photo storage is access-controlled and short-lived, and scan requests are
> authorized per device."

---

## 5. App Store screenshot updated for the "Presence" relabel

`06-tease.png` (both 1242×2688 and 1320×2868) showed the locked results grid with a trait
labelled **"Masculinity"**. The app now labels it **"Presence"**, so the store screenshot no
longer matched the UI — the kind of mismatch that draws a 2.3.3 flag. It is the same screen
Apple's own rejection screenshot shows.

**Both sizes have been regenerated** and now read "Cheekbones · Hair · Presence · Smile · Eyes".
No other screenshot contains that label, and none of the others were touched.

Three fixes went into `scripts/app-store-screenshots/capture-and-compose.mjs` so this is
repeatable:

- It tolerates RevenueCat's sandbox purchase button being absent under stub billing, instead of
  timing out after 30s.
- It honours `PW_CHROMIUM_PATH` when the Playwright browser is not in the default cache.
- New `--compose-only` mode rebuilds the marketing composites from the captures already in
  `_raw/`, rewriting only the shots that have a raw. This is what made it possible to rebuild
  `06-tease` alone without disturbing the other five.

One thing to know about a **full** capture run: it needs `public/e2e/hero-model.jpg`, a licensed
model photo that is deliberately not committed. It is only used for the four screenshots that
show a face (02, 03, 04, 05) — `01-hero` is composed from a committed asset, and `06-tease` is
captured before the swap happens. The script now fails with an explicit message naming the file
rather than an opaque `page.evaluate: Event`, and failing is intentional: continuing would
silently rebuild the marketing frames with the plain e2e test face.

---

## Checklist before resubmitting

- [ ] Ship a new build containing the binary changes above.
- [ ] Deploy the `looxmaxxing-api` scoring-prompt change — the 1.2 fix is only complete once the
      server no longer ranks users against other people.
- [x] `06-tease.png` regenerated in both sizes so the store screenshot shows "Presence" (section 5).
- [ ] Decide Route A or Route B for the Age Rating "Age Assurance" field (section 3).
- [ ] Send `RESOLUTION_CENTER_REPLY.md` in the Resolution Center (adjust it if you pick Route B).
- [ ] Confirm the Privacy Policy URL is still set on the App Privacy page.

## Regression cover

`e2e/app-store-guardrails.spec.ts` asserts each of these fixes and runs in CI via
`.github/workflows/e2e.yml`. If one of those five tests fails, the build is not submittable.
