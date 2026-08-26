#!/usr/bin/env node
// Stages an existing AAB versionCode into another track as a DRAFT release
// via the Play Developer API, WITHOUT re-uploading the binary (Play rejects
// duplicate versionCodes — the artifact must be referenced, not uploaded).
//
// Reads the source track's latest release, clones name + release notes onto
// the target track with status=draft. Nothing is published or sent for
// review; a human confirms the rollout in Play Console.
//
// Env:
//   ANDROID_PACKAGE_NAME            e.g. com.balkanbit.looxmaxxing
//   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON  service account with androidpublisher access
//   SOURCE_TRACK                    default: internal
//   TARGET_TRACK                    default: production
//   VERSION_CODE                    required — versionCode to stage

import crypto from 'node:crypto';

const packageName = process.env.ANDROID_PACKAGE_NAME;
const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
const sourceTrack = process.env.SOURCE_TRACK ?? 'internal';
const targetTrack = process.env.TARGET_TRACK ?? 'production';
const versionCode = Number(process.env.VERSION_CODE);

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), serviceAccount.private_key);
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function main() {
  if (!packageName || !serviceAccountJson || !versionCode) {
    throw new Error('ANDROID_PACKAGE_NAME, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON and VERSION_CODE are required');
  }
  const serviceAccount = JSON.parse(serviceAccountJson);
  const token = await getAccessToken(serviceAccount);
  const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const editRes = await fetch(`${base}/edits`, { method: 'POST', headers });
  if (!editRes.ok) throw new Error(`create edit failed: ${editRes.status} ${await editRes.text()}`);
  const { id: editId } = await editRes.json();
  console.log(`edit ${editId} opened`);

  try {
    // Clone name/notes from the source track's release carrying this versionCode.
    const srcRes = await fetch(`${base}/edits/${editId}/tracks/${sourceTrack}`, { headers });
    let name;
    let releaseNotes;
    if (srcRes.ok) {
      const src = await srcRes.json();
      const match = (src.releases ?? []).find(r => (r.versionCodes ?? []).map(Number).includes(versionCode))
        ?? (src.releases ?? [])[0];
      if (match) {
        name = match.name;
        releaseNotes = match.releaseNotes?.length ? match.releaseNotes : undefined;
      }
    } else if (srcRes.status !== 404) {
      throw new Error(`read ${sourceTrack} failed: ${srcRes.status} ${await srcRes.text()}`);
    }

    const body = {
      track: targetTrack,
      releases: [{
        name,
        versionCodes: [String(versionCode)],
        status: 'draft',
        ...(releaseNotes ? { releaseNotes } : {}),
      }],
    };
    console.log(`staging v${versionCode} on "${targetTrack}" as draft (name=${name ?? 'auto'}, notes=${releaseNotes ? 'copied' : 'none'})`);

    const patchRes = await fetch(`${base}/edits/${editId}/tracks/${targetTrack}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (!patchRes.ok) throw new Error(`update ${targetTrack} failed: ${patchRes.status} ${await patchRes.text()}`);

    const commitRes = await fetch(`${base}/edits/${editId}:commit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ changesNotSentForReview: false }),
    });
    if (!commitRes.ok) throw new Error(`commit failed: ${commitRes.status} ${await commitRes.text()}`);
    console.log('committed — draft staged; open Play Console → Production to review and send for review');
  } catch (err) {
    await fetch(`${base}/edits/${editId}`, { method: 'DELETE', headers }).catch(() => {});
    throw err;
  }
}

main().catch((err) => {
  console.error(String(err.message ?? err));
  process.exit(1);
});
