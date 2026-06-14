# Share cards

Implements PRD §5.3 / S6: a streak card (heatmap, no scores) and a per-scan score card (exact per-trait percentiles + overall, no deltas), shared via direct-social icons + a native "More" sheet.

SDKs: `react-native-view-shot` (capture a card view → PNG) + `react-native-share` (direct social deep links + OS share sheet).

## Code map

| File | Role |
|---|---|
| `src/components/share/ShareCards.tsx` | The two branded card visuals (`StreakShareCard`, `ScoreShareCard`). Plain components — captured via a wrapper ref in the sheet. |
| `src/components/share/ShareSheet.tsx` | Bottom sheet: card preview + icon row (Stories/X/WhatsApp/TikTok) + More + Cancel. Wraps the card in a capture `View` (callback ref), calls the share service. |
| `src/components/icons/SocialIcons.tsx` | Monochrome cream brand glyphs (swap for full-colour brand assets before ship if desired). |
| `src/services/share.ts` | **Native** capture + share. `captureCard(ref)` → tmpfile uri; `shareCard(target, uri, message)` routes to `react-native-share`. |
| `src/services/share.web.ts` | **Web stub** — `captureCard` returns null, `shareCard` falls back to `navigator.share`. Keeps native modules out of the web bundle (same platform-split rule as `purchases`). |

Entry points: Streak screen "Share streak" (streak card) and the Results header "Share" (score card). Per PRD the score card's Share button is also intended on every Ratings-history entry (item 22, not built yet).

## Native config required before it works on device

`react-native-share` and `react-native-view-shot` are native modules — **not in Expo Go or web**. Needs `npx expo run:ios` / an EAS dev build. Then:

1. **Facebook App ID** — the Instagram Stories deep link requires one. Replace `FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'` in `src/services/share.ts` and register the app in the Meta developer console.
2. **iOS `LSApplicationQueriesSchemes`** (Info.plist / app.json `ios.infoPlist`) — add the schemes the deep links query: `instagram-stories`, `instagram`, `whatsapp`, `twitter`, `tiktoksharesdk` (and `fb`).
3. **iOS photo-add usage string** — `NSPhotoLibraryAddUsageDescription` if "save to camera roll" via the share sheet is used.
4. **TikTok** currently routes through the generic share sheet (`Share.open`) — TikTok's first-party share SDK is a separate integration if direct-to-TikTok is needed later.

## Status / honest scope

- **Verified on web:** both cards render correctly, the share sheet (icon row + More) opens, and taps are handled without crashing (web stub).
- **Not verified:** the actual capture-to-image and the native/social shares — those run only on a device build with the config above. The code is written to the `react-native-share` API but the IG Stories / X / WhatsApp / TikTok invocations are device-only and untested here.
- Cards are portrait branded cards; full-bleed 9:16 IG-Story optimisation is a later refinement.
