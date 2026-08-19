# Resolution Center reply — submission b876a2fb-58e8-4bd9-b859-f7d5e1db03d2

Everything below the line is one message, ready to paste into App Store Connect once the new
build is uploaded. It answers all four items in the 17 August rejection.

It assumes **Route A** on the age rating (keep the "Age Assurance" selection and show Apple where
the gate is). If you go with Route B instead, set Age Assurance to "None" in App Store Connect
and delete the "Guideline 2.3.6" section from the reply.

Background and code references are in `APP_REVIEW_RESPONSE_2026-08-17.md`. Do not paste that
document — it is written for us, not for Apple.

---

Hello,

Thank you for the detailed feedback. We have addressed all four items. A new build is attached.

**Guideline 5.1.1(iv) — camera permission**

The pre-permission screen no longer directs the user to grant access. The button is now labelled
"Continue", and the supporting text simply states the purpose: "Axend uses the camera to take the
front photo your scores are read from." The decision is left entirely to the system prompt.

We also handled the case you raised in your guidance: if the user has previously declined and iOS
will no longer present its prompt, the screen explains that camera access is off, points out that
choosing an existing photo from the library still works, and offers an "Open Settings" button that
deep-links to the app's settings. Selecting a photo from the library remains available on the same
screen throughout, so declining the camera never blocks the flow.

**Guideline 1.2 — user generated content**

We have removed the features that could be read as objectifying a person.

The shareable results card no longer contains a photograph. Previously it paired the user's own
photo with their trait scores and could be shared to Instagram, X, TikTok and WhatsApp. The photo
has been removed entirely; the card now shows only the user's progress against their own earlier
baseline, with nothing identifying on it.

We also changed how the scores are produced. Our scoring service previously estimated each trait
relative to other people. It now produces a descriptive rating of the individual feature on a
fixed scale, and is explicitly instructed never to rank or compare the person against anyone else,
and never to rate overall attractiveness, desirability, or the person themselves.

The trait previously labelled "Masculinity" is now labelled "Presence". It describes posture and
bearing — its associated plan has always been a posture routine — and the previous label claimed
more than the score measures.

Finally, our Terms of Use have always required that users submit only photos of themselves. That
rule is now stated in the app on the capture screen itself: "Scan your own face only."

For completeness: the app has no accounts, no social graph, no feed, and no user-to-user content.
There is no feature that lets anyone rate, rank, browse or comment on another person.

**Guideline 2.3.6 — In-App Controls**

The app does include an age assurance mechanism. To locate it:

1. Launch the app and tap "Scan my face" on the welcome screen.
2. Step 2 of onboarding is "How old are you?" — an age band must be selected before the user can
   continue.
3. Selecting "Under 17" shows a screen reading "Axend is for ages 17 and up" and the flow stops
   there. There is no way past it.
4. After onboarding, the declaration is visible and can be changed at Profile → Age.

In this build we also made the block persistent: previously, force-quitting on the ineligible
screen and relaunching returned the user to the welcome screen. The under-17 declaration is now
stored and re-applied on launch. We additionally corrected the age bands, which ran "Under 17"
then "18–24" and left a 17-year-old — who is eligible for a 17+ app — without a truthful option.
The band now reads "17–24".

The app does not include Parental Controls, and we have not claimed them.

**Guideline 2.1 — face data**

*What face data does the app collect?*

Two ordinary photographs of the user's own face: a front photo and an optional profile photo,
captured with the camera or chosen from the photo library by the user's explicit action, one scan
at a time.

The app does not create, derive or store a faceprint, face template, face geometry map, face
embedding, or any other biometric identifier. It does not use ARKit face tracking, Vision
face-identity APIs, LocalAuthentication, or any face-recognition SDK. No face data is used to
identify, authenticate or re-identify anyone, and nothing derived from a face is retained after a
scan. What is retained is the output: seven integers from 0 to 100, one per cosmetic trait,
stored only on the user's own device.

*Use, sharing, retention, deletion and storage*

Use: solely to compute the seven trait scores shown to that user, and — if the user opens the
optional Avatars feature — to generate a stylized preview of their own photo. Face photos are
never used for identification, authentication, advertising, profiling, analytics or model
training.

Storage: photos live in the app's sandboxed storage on the device. During a scan the photo is
uploaded over HTTPS/TLS using a single-use signed upload URL, held in an ephemeral inbox, and read
into memory by the scoring service.

Retention: the server-side copy is deleted immediately after scoring, within the same request. The
deletion runs whether scoring succeeded or failed, so a failed scan leaves nothing behind. Only
the numeric scores return to the device. Generated avatar images are served from a temporary
signed link that expires automatically. No face photo is retained on our servers after the request
that produced it.

Deletion: the user can delete the on-device copies at any time via Profile → Privacy → Delete my
photos, or Profile → Privacy → Delete all my data, or by uninstalling the app. "Delete all my
data" also clears anything associated with the anonymous identifier on our side.

Sharing: face photos are never sold, never shared for advertising, and never disclosed to anyone
beyond the transient processing described below.

*Will the face data be shared with any third parties? Where will this information be stored?*

Face photos are disclosed to two categories of processor, both bound by data processing
agreements, and in both cases transiently:

1. Our cloud hosting and storage provider, which holds the photo in the single-use signed upload
   slot for the seconds between upload and scoring, after which it is deleted.
2. Our AI inference provider (OpenAI), which receives the photo in the scoring request, returns
   the trait scores, and does not retain the photo or use it for model training.

No other third party receives face data. Our subscription processor (RevenueCat) receives only an
anonymous identifier and purchase status, never photos. The app contains no advertising SDKs and
no third-party analytics SDKs, and does not track users across other companies' apps or websites.

Where a processor operates outside the European Economic Area, transfers are covered by the
European Commission's Standard Contractual Clauses or an adequacy decision, including the EU–US
Data Privacy Framework where applicable. The data controller is "Pazaruvai Umno" EOOD, UIC
206373314, Sofia, Bulgaria.

*How long will face data be retained?*

On our servers: not retained — deleted immediately after scoring, within the same request. On the
user's device: until the user deletes the photos in the app or uninstalls the app, entirely under
their control. Generated avatar images: served from a temporary link that expires automatically.

*Where in the privacy policy is this explained?*

At https://balkanbit.app/axend/privacy-policy:

- Section 2, "What the App does with your photos" — collection, upload, processing, immediate
  server-side deletion, and the prohibition on identification, sale, advertising and model
  training.
- Section 3, "Categories of data we process" — first bullet, "Face photos".
- Section 4, "Lawful bases for processing" — first bullet, explicit consent under Art. 6(1)(a) and
  Art. 9(2)(a) GDPR.
- Section 5, "Service providers" — the cloud storage and AI inference processors, and the
  international transfer safeguards.
- Section 6, "Retention" — first bullet, server-side photo retention.
- Section 7, "Your rights" — access, rectification, restriction, withdrawal of consent, erasure.
- Section 9, "Security" — TLS in transit, single-use signed URLs, access-controlled and short-lived
  server-side storage.

*Quoted text from the privacy policy concerning face data*

From Section 2, "What the App does with your photos":

"Axend generates appearance trait scores from two photos of your face (a front photo and a profile
photo) that you capture with your camera or select from your photo library. Because your face is
sensitive data, we designed the App to handle photos as minimally as possible:"

"Photos are stored locally on your device. You can delete them at any time in Profile → Privacy →
Delete my photos."

"When you run a scan, your photos are uploaded over encrypted HTTPS connections using single-use,
signed upload links to our secure cloud storage."

"Our scoring service analyzes the photos with an AI model to produce your trait scores, and deletes
both photos from our servers immediately after scoring. Only the numeric scores are returned to
your device."

"If you use the avatar feature, your reference photo is uploaded the same way to generate a
stylized image; the generated image is served from a temporary link that expires automatically."

"Your photos are never used to identify you, sold, shared for advertising, or used to train AI
models."

From Section 3, "Categories of data we process":

"Face photos — front and profile photos, processed transiently as described in Section 2."

From Section 4, "Lawful bases for processing":

"Consent (Art. 6(1)(a) and Art. 9(2)(a) GDPR) — for capturing and processing your face photos. You
grant camera and photo library access through the operating system prompts, and each scan is
started only by your explicit action. You may withdraw consent at any time by deleting your photos
and not running further scans."

From Section 6, "Retention":

"Photos on our servers — deleted immediately after scoring; generated avatar images expire
automatically."

From Section 9, "Security":

"All data in transit is encrypted with HTTPS/TLS. Photo uploads use single-use signed URLs,
server-side photo storage is access-controlled and short-lived, and scan requests are authorized
per device."

Please let us know if anything above needs expanding.

Thank you,
The Axend team
