# CI/CD — Android APK release + cache

`.github/workflows/deploy.yml` runs on every push to `main`/`master` (and via manual `workflow_dispatch`):

1. **quality** — `tsc --noEmit` + `expo lint`, with npm dependency caching (`actions/setup-node` `cache: npm`, keyed on `package-lock.json`). The mobile analog of the Docker layer cache (`type=gha`) in the cold-email web deploy.
2. **android** — builds a **standalone Android APK in the runner** (no EAS): `expo prebuild` → `./gradlew assembleRelease` (Expo's prebuild signs the release variant with the debug key, so the APK is installable for sideloading). The APK is published as a **GitHub Release** (tag `android-<run#>`, titled with the commit SHA) and as a workflow artifact, so it has a direct download link to open on your phone. Caches npm deps **and** Gradle.

## Install on your phone

After a run finishes, open the repo's **Releases** → latest → download `looxmaxxing-<sha>.apk` → install (enable "install from unknown sources"). It's debug-signed (fine for sideloading, not for the Play Store — for that, add a release keystore + signing config).

## Secrets / env vars

App code reads public config from `EXPO_PUBLIC_*` env vars, inlined into the JS bundle at build time:

| Var | Used by | Source |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_KEY` | `src/services/purchases.ts` | `.env` locally, GitHub Actions secret in CI |
| `EXPO_PUBLIC_FACEBOOK_APP_ID` | `src/services/share.ts` (IG Stories) | `.env` locally, GitHub Actions secret in CI |

- **Local:** copy `.env.example` → `.env` and fill in (`.env` is gitignored).
- **CI:** set the same names as repo **Actions secrets** (`gh secret set EXPO_PUBLIC_REVENUECAT_KEY`, etc.). The workflow passes them as build-time env on the `android` job.

`EXPO_PUBLIC_FACEBOOK_APP_ID` is currently empty (no real FB app yet) — the IG Stories deep link stays inactive until it's filled; everything else works.
