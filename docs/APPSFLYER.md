# AppsFlyer Integration

SDK: `react-native-appsflyer` (6.18.0).

## Code map

| File | Role |
|---|---|
| `src/services/appsflyer.ts` | Native-only implementation, mirrors the `purchases.ts` lazy-require pattern — `Platform.OS === 'web'` (or Expo Go) resolves to a no-op. Exposes init, set customer user ID, log event. |
| `src/store/SubscriptionContext.tsx` | Calls `initAppsFlyer()` right after RevenueCat configures, then sets the AppsFlyer customer user ID to RevenueCat's `getAppUserID()` so both SDKs share one identity. |
| `app.json` → `expo.plugins` | `"react-native-appsflyer"` — the package's Expo config plugin, applied at `expo prebuild`. Defaults are safe (no purchase-connector gradle flag, does not touch existing Android backup-rule attributes). |

## App IDs

- **Android**: `com.balkanbit.looxmaxxing` (from `app.json` → `expo.android.package`). Not passed explicitly — Android doesn't require the `appId` init option.
- **iOS**: not yet configured — there is no `ios/` project in this repo yet. Once the app is submitted to App Store Connect, set `EXPO_PUBLIC_APPSFLYER_APP_ID` to the numeric Apple ID (e.g. `id123456789` → `123456789`) before shipping an iOS build; `initAppsFlyer()` currently skips init on iOS if this is blank.

## API keys

- `EXPO_PUBLIC_APPSFLYER_DEV_KEY` — Dev key from AppsFlyer dashboard → App settings. Public/embeddable, safe to ship in the binary (same trust model as the RevenueCat key).
- `EXPO_PUBLIC_APPSFLYER_APP_ID` — iOS only, see above.

## Running it

- **Web / Expo Go**: native module unavailable, `initAppsFlyer()` resolves `false` and every other export no-ops.
- **Device / dev build**: `npx expo run:android` (or an EAS development build) — the native module is not in Expo Go.
- **Verifying the SDK integration**: AppsFlyer's dashboard "Test SDK Integration" tool requires a real install on a device/emulator running a debug build with the dev key configured (`isDebug: __DEV__` enables verbose native logs — filter logcat for `AppsFlyer_*`). Trigger an app open, then check the dashboard within a few minutes. This has not been run against the live dashboard yet — do that as the next step with a device or the (currently disk-space-blocked) emulator.

## Notes

- `PCAppsFlyerPackage` (Purchase Connector) autolinks alongside the core `RNAppsFlyerPackage` but is unused — RevenueCat owns purchase validation; the connector's gradle flag was left off in the Expo plugin config.
- Deep link listeners are not wired yet (`onDeepLinkListener: true` is set in `initSdk`, but no `onDeepLink` callback is registered) — add one if/when OneLink deep linking is needed.
