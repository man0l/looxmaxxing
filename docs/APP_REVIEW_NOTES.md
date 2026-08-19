# App Review Notes — build 28

Paste the block below the rule into **App Store Connect → your app → the version → App Review
Information → Notes**. It is ~2,600 characters; the field allows 4,000.

This is *not* the same as the Resolution Center reply. Two different fields, two different jobs:

| | Where | What goes in it |
|---|---|---|
| **App Review Notes** | App Review Information → Notes | Short. What changed since the rejected build, and where to find things. Travels with the submission and is the first thing the reviewer reads. |
| **Resolution Center reply** | Resolution Center thread | Long. The full answers, including the six face-data questions under guideline 2.1. See `RESOLUTION_CENTER_REPLY.md`. |

Send both. The Notes field is too short for the face-data answers, and the Resolution Center reply
is not shown to the reviewer alongside the build.

---

Build 28 addresses all four items from the 17 August rejection of build 27.

GUIDELINE 5.1.1(iv) — CAMERA PERMISSION

The pre-permission screen no longer directs the user to grant access. The button reads "Continue"
instead of "Allow camera", and the supporting text states only the purpose: "Axend uses the camera
to take the front photo your scores are read from." The decision is left to the system prompt.

If camera access was previously denied and iOS will not present its prompt again, the screen
explains that access is off and offers an "Open Settings" button. Choosing an existing photo from
the library is available on the same screen throughout, so declining the camera never blocks the
flow.

GUIDELINE 1.2 — OBJECTIFYING REAL PEOPLE

- The shareable results card no longer contains a photograph. It previously paired the user's own
  photo with their trait scores. It now shows only their progress against their own earlier
  baseline, with nothing identifying on it.
- Our scoring service no longer estimates traits relative to other people. It rates the individual
  feature on a fixed scale and is explicitly instructed never to rank or compare the person
  against anyone else, and never to rate overall attractiveness or the person themselves.
- The trait previously labelled "Masculinity" is now "Presence". It describes posture and bearing.
- The capture screen now states "Scan your own face only" — a rule our Terms of Use already
  required, now visible in the app.

The app has no accounts, no social graph, no feed and no user-to-user content. No feature lets
anyone rate, rank, browse or comment on another person.

GUIDELINE 2.3.6 — AGE ASSURANCE

The 17+ age gate is at step 2 of onboarding:

1. Tap "Scan my face" on the welcome screen.
2. "How old are you?" — an age band must be selected before continuing.
3. Selecting "Under 17" shows "Axend is for ages 17 and up" and the flow stops there. There is no
   way past it.
4. After onboarding, the declaration is visible and can be changed at Profile → Age.

In this build the under-17 block also persists across app relaunches, and the age bands now start
at 17 so a 17-year-old has a truthful option.

GUIDELINE 2.1 — FACE DATA

Full answers to all six questions are in our Resolution Center reply. In summary: the app
processes two ordinary photographs of the user's own face, creates no faceprint, face template or
other biometric identifier, deletes the server-side copy immediately after scoring, and retains
only seven numeric scores stored on the user's own device.

DEMO ACCESS

None needed. The app has no accounts or sign-in.
