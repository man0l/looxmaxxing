# RevenueCat Integration

SDK: `react-native-purchases` + `react-native-purchases-ui` (both pinned to the same version, currently 10.3.0).

## Code map

| File | Role |
|---|---|
| `src/services/purchases.ts` | **Native implementation** (iOS/Android). All SDK access; lazy-requires the native module. Exposes configure, customer info, offerings, purchase, restore, listener, RevenueCat Paywall, Customer Center. |
| `src/services/purchases.web.ts` | **Web stub** with the identical export surface — every function no-ops or returns "not available". |

### Platform-file split (do not break this)

`react-native-purchases` ships only a React Native entry point, so Metro's web
bundler cannot resolve it — even a `Platform.OS` guard fails, because Metro
resolves `require()` statically at bundle time. The fix is Metro's platform
extension resolution: importing `'../services/purchases'` resolves
`purchases.web.ts` on web (Metro never reads `purchases.ts`, so the native
module never enters the web bundle) and `purchases.ts` on native. `tsc`
resolves `purchases.ts`. **Consequence: any new export must be added to BOTH
files with matching signatures.** Type-only imports from
`react-native-purchases` are fine in the web stub — they're erased at compile
time and never trigger Metro resolution.
| `src/store/SubscriptionContext.tsx` | App-level subscription state. Configures the SDK on mount, hydrates `subscribed` from the `Looksmaxxing Pro` entitlement, subscribes to customer-info updates, drives the custom paywall. |
| `src/screens/PaywallScreen.tsx` | PRD §4.3 custom paywall. Reads live `priceString` per package from the current offering; falls back to placeholder prices when offerings are unavailable (web dev). |
| `src/screens/ProfileScreen.tsx` | Subscription status, Customer Center entry (`Manage subscription`), restore. |

## Entitlement

Single entitlement gates everything: **`Looksmaxxing Pro`** (exact string, see `ENTITLEMENT_ID` in `src/services/purchases.ts`). Pro status = `customerInfo.entitlements.active['Looksmaxxing Pro']` exists. Never check product IDs directly — always the entitlement.

## Dashboard setup (do once)

1. **Project → Apps**: add the iOS app with the bundle identifier from `app.json`. Add Android later if needed.
2. **Entitlements**: create `Looksmaxxing Pro`.
3. **Products**: create these, matching the App Store Connect in-app purchase IDs:
   - `weekly` (auto-renewing, 1 week)
   - `monthly` (auto-renewing, 1 month)
   - `yearly` (auto-renewing, 1 year)
   - `lifetime` (non-consuming one-time purchase)
   Attach **all four** to the `Looksmaxxing Pro` entitlement.
4. **Offerings**: in the `default` offering create packages and attach products:
   - `$rc_weekly` → `weekly`
   - `$rc_monthly` → `monthly`
   - `$rc_annual` → `yearly`
   - `$rc_lifetime` → `lifetime`
   The custom paywall currently surfaces only `$rc_weekly` and `$rc_annual` (PRD §4.3: weekly + annual, annual pre-selected). Monthly and lifetime ride along in the offering for the P2 paywall A/B program (item 28) without an app update.
5. **App Store Connect**: create the same four IAPs, fill in localized pricing, and paste the App-Specific Shared Secret into RevenueCat.

## API keys

`src/services/purchases.ts` currently holds the **test key** (`test_…`). Before TestFlight/release, replace it with the production Apple key (`appl_…`) from Project Settings → API Keys. Public SDK keys are safe to ship in the binary. If Android is added, branch on `Platform.OS` and use the `goog_…` key.

## Running it

- **Web (`expo start --web`)**: native module is never loaded. Offerings are `null`, the paywall shows placeholder prices, and `subscribe()` auto-grants Pro **in `__DEV__` only** so the funnel stays testable. Production builds never auto-grant.
- **Device**: `npx expo run:ios` (or an EAS development build). Expo Go does not include the native module.
- **Sandbox testing**: sign into a Sandbox Apple ID on device; purchases on the test key show up in the RevenueCat sandbox dashboard.

## RevenueCat Paywalls & Customer Center

- `presentRevenueCatPaywallIfNeeded()` (in `src/services/purchases.ts`) shows the dashboard-designed RevenueCat Paywall only when the user lacks `Looksmaxxing Pro`, and resolves `true` on purchase/restore. The PRD mandates the custom blurred-results paywall as primary, so this is wired but unused — intended for the P2 paywall A/B program, where dashboard paywalls can be iterated without app releases. Requires a paywall configured on the `default` offering in the dashboard.
- `presentCustomerCenter()` opens RevenueCat's Customer Center (cancel, refund, plan changes); surfaced as "Manage subscription" on Profile for subscribers. Configure its appearance under Tools → Customer Center.

## Best practices encoded in the service

- Versions of `react-native-purchases` and `react-native-purchases-ui` must match — upgrade them together.
- `configure()` is called exactly once, at provider mount; everything else no-ops until it succeeds.
- Debug SDK logs in `__DEV__` (`LOG_LEVEL.DEBUG`).
- Purchase errors distinguish user cancellation (silent) from real failures (shown under the CTA).
- `addCustomerInfoUpdateListener` keeps `subscribed` in sync with renewals/expiry/refunds while the app runs; the entitlement is re-checked from `getCustomerInfo()` on every launch.
- Anonymous app user IDs (RevenueCat default) — no `logIn()` until the app grows accounts.
