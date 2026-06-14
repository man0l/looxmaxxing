# CI/CD — release + cache

`.github/workflows/deploy.yml` runs on every push to `main`/`master`:

1. **quality** — `tsc --noEmit` + `expo lint`, with npm dependency caching (`actions/setup-node` `cache: npm`, keyed on `package-lock.json`). This is the mobile analog of the Docker layer cache (`type=gha`) in the cold-email web deploy.
2. **release** — publishes an **EAS Update** to the `production` channel. The channel is the moving pointer (like an image `:latest` tag); the commit short-SHA is the update message (like a `:<sha>` tag). Devices on the production channel auto-pull the new JS bundle — the mobile equivalent of Watchtower auto-pulling new images.

## One-time setup before the pipeline is green

- **`EXPO_TOKEN` repo secret** — create an access token at https://expo.dev (Account → Access tokens) and add it under repo Settings → Secrets → Actions. (Analogous to the cold-email `SUPABASE_DB_URL` / GHCR token.)
- **EAS project** — run once locally: `eas init` then `eas update:configure` (sets `runtimeVersion`, `updates.url`, and `extra.eas.projectId` in `app.json`).
- **Native binaries** — `eas build --profile production` (queued, produces `.ipa`/`.apk`). EAS Update only ships JS/asset changes over an existing native build; ship a new build when native deps change.

Build profiles live in `eas.json` (`development` / `preview` / `production`).
