#!/usr/bin/env bash
set -euo pipefail

EXPECTED_SHA1="${EXPECTED_SHA1:-2E:4F:A1:41:F9:74:6D:F5:3D:EA:EB:F0:FD:4F:45:2E:FD:5E:B9:45}"
KEYSTORE_PATH="${1:?usage: set-github-android-secrets.sh <keystore.p12|jks> [alias] [storepass]}"
KEY_ALIAS="${2:-}"
STORE_PASS="${3:-}"

if [[ -z "$STORE_PASS" ]]; then
  read -r -s -p "Keystore password: " STORE_PASS
  echo
fi

if [[ -z "$KEY_ALIAS" ]]; then
  KEY_ALIAS=$(keytool -list -keystore "$KEYSTORE_PATH" -storepass "$STORE_PASS" 2>/dev/null | awk -F, '/PrivateKeyEntry|SecretKeyEntry/ {print $1; exit}')
  [[ -n "$KEY_ALIAS" ]] || KEY_ALIAS="upload"
fi

KEY_PASS="${ANDROID_KEY_PASSWORD:-$STORE_PASS}"

SHA1=$(keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$STORE_PASS" -alias "$KEY_ALIAS" 2>/dev/null | awk -F': ' '/SHA1:/ {print $2; exit}')
if [[ -z "$SHA1" ]]; then
  echo "error: could not read SHA1 for alias $KEY_ALIAS" >&2
  exit 1
fi

echo "Keystore SHA1: $SHA1"
echo "Play expects:  $EXPECTED_SHA1"
if [[ "$SHA1" != "$EXPECTED_SHA1" ]]; then
  echo "error: fingerprint mismatch — use the keystore Play Console expects" >&2
  exit 1
fi

if base64 --help 2>&1 | grep -q -- '--decode'; then
  B64=$(base64 --wrap=0 "$KEYSTORE_PATH")
else
  B64=$(base64 -w0 "$KEYSTORE_PATH")
fi

gh secret set ANDROID_KEYSTORE_BASE64 --body "$B64"
gh secret set ANDROID_KEYSTORE_PASSWORD --body "$STORE_PASS"
gh secret set ANDROID_KEY_ALIAS --body "$KEY_ALIAS"
gh secret set ANDROID_KEY_PASSWORD --body "$KEY_PASS"

echo "GitHub secrets updated. Re-run the Android Release workflow on master."