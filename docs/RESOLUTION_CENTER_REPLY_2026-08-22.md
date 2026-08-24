# Resolution Center reply — submission 014762cc-462b-4535-a257-3a61f07e6b15

Paste everything below the line into App Store Connect after the new binary (with the OpenAI consent screen) is uploaded. Body is 3933 characters (limit 4000). Also copy it into App Review Information → Notes.

Live policy: https://balkanbit.app/axend/privacy-policy

---

Hello,

Thank you for the review. We addressed both items.

The app sends face photos to OpenAI for scoring and, if used, Avatars. We added an in-app consent screen that names OpenAI, states what is sent, and requires agreement before any upload.

How to verify
1. Complete onboarding to the scan.
2. After the front photo, before upload, a screen titled "We send your photos to OpenAI" states: front and profile face photos are sent to OpenAI for trait scores (Avatars: front photo for a stylized preview); photos are deleted from our servers immediately after and are not used to train models.
3. "Agree and continue" is required to upload. "Don't send" returns to capture with no upload.
4. Capture also names OpenAI. Withdraw in Profile → Privacy → Photo sharing with OpenAI.
5. Policy: https://balkanbit.app/axend/privacy-policy (Sections 2, 4, 5).

Guideline 2.1 — face data

What face data does the app collect?
Two photos of the user's own face (front and profile), from camera or library. Optionally the front photo is reused for Avatars. We do not create a faceprint, template, embedding, or other biometric identifier, and we do not use ARKit, Vision identity APIs, LocalAuthentication, or any face-recognition SDK. Face data is not used to identify, authenticate, or recognize anyone.

Use, sharing, retention, deletion, storage
Use: seven trait scores and an optional stylized preview of the same person. Never for ID, ads, profiling, analytics, or model training.
Storage: on-device sandbox. During a scan, uploaded over HTTPS via a single-use signed URL to ephemeral storage, then scored in memory.
Retention: server copy deleted immediately after scoring in the same request (success or fail). Only numeric scores return. Avatar images use a temporary signed link that expires. No photo is kept on our servers after that request.
Deletion: Profile → Privacy → Delete my photos, Delete all my data, or uninstall.

Will face data be shared with third parties? Where stored?
Yes, transiently, with two processors under DPAs:
1. Our cloud host, for seconds between upload and scoring, then deleted.
2. OpenAI, Inc., which receives the photo for scoring/avatar, returns the result, and does not retain it or train on it.
No one else gets face data. RevenueCat gets only an anonymous ID and purchase status. No ads or analytics SDKs.

How long retained?
Servers: not retained — deleted immediately after scoring. Device: until the user deletes photos or uninstalls. Avatar images expire automatically.

Where in the privacy policy?
https://balkanbit.app/axend/privacy-policy
§2 photos; §3 Face photos; §4 consent (in-app OpenAI screen); §5 OpenAI, Inc.; §6 retention; §7 rights; §9 security.

Quoted policy text (face data)

§2: "Our scoring service sends the photos to OpenAI to produce your trait scores, and deletes both photos from our servers immediately after scoring. Only the numeric scores are returned to your device."
"If you use the avatar feature, your reference photo is uploaded the same way and sent to OpenAI to generate a stylized image."
"Your photos are never used to identify you, sold, shared for advertising, or used to train AI models."
"Photos are stored locally on your device. You can delete them at any time in Profile → Privacy → Delete my photos."

§4: "Consent (Art. 6(1)(a) and Art. 9(2)(a) GDPR) — for capturing and processing your face photos, and for sending those photos to OpenAI. You confirm this on the in-app screen that names OpenAI before any photo is uploaded."

§5: "OpenAI, Inc. — AI inference for trait scoring and optional avatar previews. Face photos are processed transiently to compute the result; they are not retained by OpenAI or used for model training. OpenAI is bound by a data processing agreement and provides the same or equal protection of this data."

§6: "Photos on our servers — deleted immediately after scoring; generated avatar images expire automatically."
