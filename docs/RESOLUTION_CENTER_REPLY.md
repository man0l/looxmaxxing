# Resolution Center reply — submission b876a2fb-58e8-4bd9-b859-f7d5e1db03d2

Everything below the rule is one message, fitted to the 4,000-character limit: 3,904 characters,
or 3,927 if the field counts CRLF line endings. Paste it into the Resolution Center once build 28
is attached. If you edit it, re-check the count — the margin is deliberate but small.

It assumes **Route A** on the age rating (keep the "Age Assurance" selection and show Apple where
the gate is). For Route B, set Age Assurance to "None" in App Store Connect and delete the 2.3.6
paragraph.

The first three guidelines are deliberately terse here because `APP_REVIEW_NOTES.md` carries them
in full and travels with the build. The bulk of this message is guideline 2.1, which is the only
item that requires a written answer. Background is in `APP_REVIEW_RESPONSE_2026-08-17.md` — do not
paste that one.

---

Hello,

Build 28 addresses all four items; the App Review Notes attached to the build cover the UI changes in more detail.

5.1.1(iv) — Camera permission. The pre-permission button now reads "Continue", not "Allow camera", and the text states only the purpose. If access was already denied, the screen offers "Open Settings"; the photo library stays available throughout, so declining never blocks the flow.

1.2 — Objectifying real people. The shareable card no longer contains a photograph; it shows only the user's progress against their own baseline. Our scoring service no longer rates traits relative to other people — each feature is rated on a fixed scale, with explicit instruction never to compare the person against anyone else or rate them overall. "Masculinity" is now "Presence" (posture and bearing), and the capture screen states "Scan your own face only". The app has no accounts, feed or user-to-user content.

2.3.6 — Age assurance. The 17+ gate is onboarding step 2, "How old are you?": selecting "Under 17" shows "Axend is for ages 17 and up" and stops the flow, with no way past it. It is also visible at Profile → Age, now persists across relaunches, and the bands start at 17. We claim no Parental Controls.

2.1 — Face data.

What we collect and how it is used: two ordinary photographs of the user's own face (front, plus an optional profile), captured or chosen by their explicit action, used solely to compute their scores and, in the optional Avatars feature, a stylized preview of their own photo. We create no faceprint, face template, geometry map, embedding or other biometric identifier, and use no ARKit face tracking, Vision face-identity APIs, LocalAuthentication or face-recognition SDK. Face data is never used to identify or authenticate anyone, and never for advertising, profiling, analytics or model training. What is retained is the output: seven integers from 0 to 100, one per cosmetic trait, stored only on the user's own device.

Storage and retention: the photo is uploaded over HTTPS/TLS via a single-use signed URL and read into memory by the scoring service. The server-side copy is deleted immediately after scoring, in the same request, whether scoring succeeded or failed. Only the numeric scores return to the device; no face photo is retained on our servers after the request that produced it. On-device copies remain until the user deletes them (Profile → Privacy → Delete my photos, or Delete all my data) or uninstalls.

Third parties: face photos go transiently to two processors, both under data processing agreements — our cloud storage provider, which holds the photo in the signed upload slot for the seconds before scoring then deletes it, and our AI inference provider, OpenAI, which receives it in the scoring request, retains nothing and does not train on it. No one else receives face data; RevenueCat gets only an anonymous identifier and purchase status. There are no advertising or analytics SDKs. EEA transfers rely on Standard Contractual Clauses or an adequacy decision. Controller: "Pazaruvai Umno" EOOD, UIC 206373314, Sofia, Bulgaria.

Privacy policy: https://balkanbit.app/axend/privacy-policy — Sections 2 (photos), 3 (data categories), 4 (Art. 9(2)(a) consent), 5 (processors), 6 (retention), 7 (rights), 9 (security).

Quoted from Section 2: "Photos are stored locally on your device. You can delete them at any time in Profile → Privacy → Delete my photos." / "Our scoring service analyzes the photos with an AI model to produce your trait scores, and deletes both photos from our servers immediately after scoring. Only the numeric scores are returned to your device." / "Your photos are never used to identify you, sold, shared for advertising, or used to train AI models." Section 6: "Photos on our servers — deleted immediately after scoring; generated avatar images expire automatically."

Thank you,
The Axend team
