/**
 * Capture current app UI (Expo web + Playwright) and composite App Store
 * marketing screenshots for 6.5" (1242×2688) and 6.9" (1320×2868).
 *
 * Usage (from repo root, with Expo web already running on :19006 OR let this start it):
 *   node scripts/app-store-screenshots/capture-and-compose.mjs
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT_65 = path.join(ROOT, 'docs/app-store-screenshots/en-US');
const OUT_69 = path.join(ROOT, 'docs/app-store-screenshots/en-US-6.9in');
const RAW = path.join(ROOT, 'docs/app-store-screenshots/_raw');
const WORK = path.join(ROOT, 'docs/app-store-screenshots/_work');
const PORT = 19006;
const BASE = `http://localhost:${PORT}`;
const W = 1242;
const H = 2688;
// Apple's required 6.9" portrait size — exact, not derived from the 6.5" aspect.
const W_69 = 1320;
const H_69 = 2868;

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const COPY = {
  '01-hero': {
    eyebrow: 'YOUR GROOMING PLAN',
    title: 'Your face,\nyour plan.',
    pill: 'Built around what you pick',
  },
  '02-traits': {
    eyebrow: 'WHAT WE LOOK AT',
    title: 'Every area,\none routine.',
    pill: '7 areas, 7 plans',
  },
  '03-progress': {
    eyebrow: 'BEFORE / AFTER',
    title: "Proof you're\nimproving.",
    pill: 'Track change over 2 weeks',
  },
  '04-plan': {
    eyebrow: 'DAILY ROUTINES',
    title: 'The plan you\nactually follow.',
    pill: '6 min a day',
  },
  '05-streak': {
    eyebrow: 'STAY CONSISTENT',
    title: 'Small steps,\nevery day.',
    pill: 'Freeze protects one slip',
  },
  '06-tease': {
    eyebrow: 'GET STARTED',
    title: 'See your full\nplan.',
    pill: 'One scan away',
  },
};

const STORAGE_KEYS = [
  'scan-store-v1',
  'practice-v1',
  'streak-v1',
  'onboarding-v1',
  'app-onboarded-v1',
  'render-cache-v1',
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Real TCP connect against 127.0.0.1. An HTTP probe here is unreliable: a system
// proxy can answer for an unbound port (404 read as "open"), which made the script
// skip starting Expo and then fail on the first navigation.
function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(1500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

async function ensureExpo() {
  if (await portOpen(PORT)) {
    console.log(`Expo already on :${PORT}`);
    return null;
  }
  console.log('Starting Expo web…');
  const child = spawn('npx', ['expo', 'start', '--web', '--port', String(PORT)], {
    cwd: ROOT,
    env: {
      ...process.env,
      ...loadDotEnv(),
      EXPO_PUBLIC_E2E: '1',
      EXPO_PUBLIC_E2E_STUB_API: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  let ready = false;
  const onData = (buf) => {
    const s = buf.toString();
    if (s.includes('http://localhost') || s.includes('Web is waiting')) ready = true;
    process.stdout.write(s);
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  for (let i = 0; i < 90; i++) {
    if (await portOpen(PORT)) {
      console.log('Expo ready');
      return child;
    }
    await sleep(2000);
  }
  throw new Error('Expo web failed to start within 3 minutes');
}

// The bottom tab bar is position:fixed and intercepts pointer events for anything
// underneath it, so a plain click can hang on actionability. Scroll into view, then
// fall back to a forced click.
async function safeClick(locator, timeout = 15_000) {
  const target = locator.first();
  await target.waitFor({ state: 'attached', timeout });
  await target.scrollIntoViewIfNeeded({ timeout }).catch(() => {});
  try {
    await target.click({ timeout });
  } catch {
    await target.click({ force: true, timeout });
  }
}

async function resetApp(page, userId) {
  // Clear explicitly rather than via addInitScript: init scripts persist for the
  // life of the page and accumulate across resetApp calls, so a later reload
  // (seedSecondScan) would wipe state the script had just seeded.
  // Expo web keeps a websocket open — never use networkidle.
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.evaluate(
    ([id, keys]) => {
      localStorage.clear();
      for (const key of keys) localStorage.removeItem(key);
      sessionStorage.setItem('e2e_app_user_id', id);
    },
    [userId, STORAGE_KEYS],
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Scan my face').waitFor({ timeout: 60_000 });
}

async function runOnboardingToPaywall(page, { skin = false } = {}) {
  await page.getByText('Scan my face').click();
  await page.getByText('How old are you?').waitFor();
  await page.getByText('25–34').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText('What would you like to work on?').waitFor();
  await page.getByText('Sharper jawline').click();
  if (skin) {
    await page.getByText('Better skin').click();
  }
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText(/held you back/i).waitFor();
  await page.getByText("Didn't know where to start").click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText('Scores usually start between 4 and 7').waitFor();
  await page.getByText('Got it', { exact: true }).click();

  await page.getByText('When do you want to see your first results?').waitFor();
  await page.getByText('In 1 month').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText('How much do you want to take on?').waitFor();
  await page.getByText('Keep it simple').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText("I'm in — let's go").click();

  await page.getByText('Front photo', { exact: true }).waitFor();
  await page.getByTestId('e2e-use-test-photo').click();

  await page.getByText('Analyzing Your Face').waitFor({ timeout: 20_000 });

  await page.getByText('Share your progress, your way').waitFor({ timeout: 30_000 });
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText(/analysis is ready/i).waitFor();
}

async function unlockPaywall(page) {
  const unlock = page.getByTestId('paywall-unlock');
  await unlock.waitFor({ timeout: 60_000 });
  await unlock.click();
  // RevenueCat's Web Billing sandbox button only appears when a RevenueCat key
  // is configured. Without one the web build falls back to stub billing and the
  // purchase resolves inline, so this step is skipped rather than timing out.
  const testPurchase = page.getByRole('button', { name: 'Test valid purchase' });
  try {
    await testPurchase.waitFor({ timeout: 10_000 });
    await testPurchase.click();
  } catch {
    /* stub billing — nothing to click */
  }
  await page.getByText(/Your baseline/).first().waitFor({ timeout: 90_000 });
}

/** Swap visible scan photos to the marketing hero (no reload — keeps entitlement). */
async function injectHeroPhoto(page) {
  const heroUrl = `${BASE}/e2e/hero-model.jpg`;
  // Warm cache so the swap is instant
  await page.evaluate(async (url) => {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const raw = localStorage.getItem('scan-store-v1');
    if (raw) {
      try {
        const store = JSON.parse(raw);
        if (store.scans?.[0]) {
          store.scans[0].photoUri = url;
          localStorage.setItem('scan-store-v1', JSON.stringify(store));
        }
      } catch {
        /* ignore */
      }
    }
    // Replace any in-app face photos currently rendered
    for (const img of document.querySelectorAll('img')) {
      const src = img.getAttribute('src') || '';
      if (
        src.includes('e2e-front') ||
        src.includes('e2e-profile') ||
        src.includes('blob:') ||
        src.includes('data:image') ||
        (img.naturalWidth > 40 && img.naturalHeight > 40 && !src.includes('brand-') && !src.includes('icon'))
      ) {
        // Prefer replacing square-ish / portrait face thumbnails used on Results
        if (img.clientWidth >= 48 && img.clientHeight >= 48) {
          img.src = url;
        }
      }
    }
  }, heroUrl);
  await sleep(400);
}

/**
 * Seed a second older scan for Compare. Done via storage + soft re-entry:
 * re-open Ratings after a storage patch by clicking the tab again once
 * ScanContext re-reads on mount — but provider is root-level, so we need a
 * rescan-style UI path. Instead: call the in-app rescan helper is unavailable;
 * we patch storage and force a full remount by toggling a dummy key only when
 * we still have entitlement. Web RC rehydrates subscribed users after purchase
 * for the session — use location reload only if needed later.
 *
 * For screenshots we open Compare by patching storage then navigating with a
 * page.evaluate that dispatches a storage event is not enough. Simpler path:
 * tap "Re-rate now" is heavy. We'll patch and use window location only for the
 * compare seed after purchase, re-waiting for results (RC web keeps session).
 */
async function seedSecondScan(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('scan-store-v1');
    if (!raw) return;
    const store = JSON.parse(raw);
    if (!store.scans?.length) return;
    const latest = store.scans[0];
    const olderScores = latest.scores.map((s) => ({
      ...s,
      percentile: Math.max(5, s.percentile - 10),
    }));
    const older = {
      id: 'scan-older',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      scores: olderScores,
      photoUri: latest.photoUri,
    };
    // Keep latest first (newest-first)
    store.scans = [latest, older];
    store.hasRealScan = true;
    localStorage.setItem('scan-store-v1', JSON.stringify(store));
  });
  // Force ScanProvider remount: hard reload. Entitlement should rehydrate from RC
  // web / test-store session if purchase completed in this browser context.
  await page.reload({ waitUntil: 'domcontentloaded' });
  // If locked, try unlock again (rare)
  const waiting = page.getByText('Your scores are waiting');
  if (await waiting.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('seedSecondScan: still locked after reload — re-unlocking');
    // open paywall banner
    await waiting.click();
    await unlockPaywall(page);
  } else {
    await page.getByText(/Your baseline|Day \d+/).first().waitFor({ timeout: 60_000 });
  }
  // Re-apply hero photo after reload (storage already has URI)
  await injectHeroPhoto(page);
}

async function hideChrome(page) {
  await page.addStyleTag({
    content: `
      /* Hide web scrollbars */
      *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      body { overflow: hidden !important; }
    `,
  });
}

async function captureViewport(page, name) {
  await hideChrome(page);
  // Wait for ring animations / fonts
  await sleep(1200);
  const out = path.join(RAW, `${name}.png`);
  await page.screenshot({ path: out, type: 'png' });
  console.log('captured', name);
  return out;
}

function phoneFrameCss() {
  return `
    .phone {
      position: relative;
      width: 980px;
      height: 2120px;
      border-radius: 72px;
      border: 3px solid #C99E6F;
      background: #15100B;
      overflow: hidden;
      box-shadow: 0 40px 120px rgba(0,0,0,0.55);
    }
    .phone.bleed-bottom {
      height: 2000px;
    }
    .status {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 62px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 48px 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      font-size: 26px;
      font-weight: 600;
      color: #fff;
      pointer-events: none;
    }
    .island {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      width: 180px;
      height: 42px;
      background: #000;
      border-radius: 24px;
      z-index: 6;
    }
    .screen {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: #15100B;
    }
    .screen img {
      width: 100%;
      height: auto;
      display: block;
      /* Shift content below status bar; crop bottom chrome (tab/FAB) */
      margin-top: 0;
      transform-origin: top center;
    }
  `;
}

function marketingShell({ eyebrow, title, pill, phoneInner, phoneClass = '', extraStyle = '' }) {
  const titleHtml = title
    .split('\n')
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join('');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    background: #0E0B07;
    font-family: "Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .canvas {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    background:
      radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,158,111,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 50% 30% at 80% 20%, rgba(61,107,230,0.08) 0%, transparent 50%),
      linear-gradient(180deg, #1A140D 0%, #0E0B07 55%, #0A0805 100%);
    overflow: hidden;
  }
  .copy {
    position: absolute;
    top: 88px;
    left: 72px;
    right: 72px;
    z-index: 2;
  }
  .eyebrow {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: #C99E6F;
    margin-bottom: 22px;
  }
  .title {
    font-size: 72px;
    font-weight: 800;
    line-height: 1.05;
    color: #F5F0E8;
    letter-spacing: -0.02em;
    margin-bottom: 28px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #EFE6D8;
    color: #1C150D;
    font-size: 26px;
    font-weight: 700;
    padding: 14px 28px;
    border-radius: 999px;
  }
  .pill-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3D6BE6;
    flex-shrink: 0;
  }
  .phone-wrap {
    position: absolute;
    left: 50%;
    top: 520px;
    transform: translateX(-50%);
    z-index: 1;
  }
  ${phoneFrameCss()}
  ${extraStyle}
</style>
</head>
<body>
  <div class="canvas">
    <div class="copy">
      <div class="eyebrow">${escapeHtml(eyebrow)}</div>
      <div class="title">${titleHtml}</div>
      <div class="pill"><span class="pill-dot"></span>${escapeHtml(pill)}</div>
    </div>
    <div class="phone-wrap">
      <div class="phone ${phoneClass}">
        <div class="island"></div>
        <div class="status">
          <span>9:41</span>
          <span style="opacity:0.9;font-size:22px">●●●● ▮</span>
        </div>
        <div class="screen">${phoneInner}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function heroPhoneInner(heroDataUrl) {
  // Full-bleed face hero with overall ring + chips matching current RingGauge look
  return `
    <div style="position:relative;width:100%;height:100%;background:#15100B;">
      <img src="${heroDataUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;margin:0;transform:none;" />
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,11,7,0.15) 0%,transparent 30%,transparent 45%,rgba(14,11,7,0.75) 72%,rgba(14,11,7,0.95) 100%);"></div>
      <div style="position:absolute;left:48px;right:48px;bottom:120px;display:flex;flex-direction:column;gap:28px;">
        <div style="display:flex;align-items:center;gap:28px;">
          <div style="position:relative;width:168px;height:168px;flex-shrink:0;">
            <svg width="168" height="168" viewBox="0 0 168 168">
              <circle cx="84" cy="84" r="74" fill="none" stroke="rgba(239,230,216,0.15)" stroke-width="14"/>
              <circle cx="84" cy="84" r="74" fill="none" stroke="#EFE6D8" stroke-width="14"
                stroke-linecap="round" stroke-dasharray="325 465" transform="rotate(-90 84 84)"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Nunito Sans',sans-serif;font-weight:800;font-size:52px;color:#EFE6D8;">5.5</div>
          </div>
          <div>
            <div style="font-family:'Nunito Sans',sans-serif;font-size:22px;color:rgba(239,230,216,0.65);font-weight:600;margin-bottom:4px;">Overall</div>
            <div style="font-family:'Nunito Sans',sans-serif;font-size:40px;font-weight:800;color:#fff;line-height:1.1;">Your baseline<br/>5.5 / 10</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${['Jawline · 6.1 / 10', 'Hair · 7.2 / 10', 'Smile · 6.4 / 10']
            .map(
              (t) =>
                `<span style="background:rgba(36,27,18,0.85);border:1px solid #3A2F21;color:#EFE6D8;font-family:'Nunito Sans',sans-serif;font-size:20px;font-weight:600;padding:12px 18px;border-radius:999px;">${t}</span>`,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function appPhoneInner(imgDataUrl, { scale = 1.0, yOffset = -20, hideBottom = 140 } = {}) {
  // Phone content is 980 wide; source is ~1170 (390*3). Scale to fill width.
  return `
    <div style="position:absolute;inset:0;overflow:hidden;">
      <img src="${imgDataUrl}" style="
        width: 100%;
        height: auto;
        margin: 0;
        transform: translateY(${yOffset}px) scale(${scale});
        transform-origin: top center;
      " />
      <div style="position:absolute;left:0;right:0;bottom:0;height:${hideBottom}px;background:linear-gradient(180deg,transparent, #15100B 40%);"></div>
    </div>
  `;
}

async function fileToDataUrl(filePath) {
  const buf = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function renderHtmlToPng(browser, html, outPath, { width = W, height = H } = {}) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: 'load' });
  await sleep(600);
  await page.screenshot({ path: outPath, type: 'png' });
  await page.close();
  console.log('wrote', outPath);
}

// Target dimensions are explicit, not a uniform scale factor: App Store Connect
// requires exact pixel sizes, and scaling 1242x2688 by 1320/1242 yields 1320x2857,
// which is 11px short of the required 6.9" height and is rejected on upload.
async function scalePngWithCss(browser, srcPath, outPath, w, h) {
  const dataUrl = await fileToDataUrl(srcPath);
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#000">
    <img src="${dataUrl}" style="width:${w}px;height:${h}px;display:block" />
  </body></html>`;
  await renderHtmlToPng(browser, html, outPath, { width: w, height: h });
}

async function captureAll(browser) {
  await mkdir(RAW, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);

  // --- Locked tease (06) — decline paywall ---
  console.log('flow: locked results');
  await resetApp(page, `ss_locked_${Date.now()}`);
  await runOnboardingToPaywall(page, { skin: true });
  await page.getByText('Maybe later', { exact: true }).click();
  await page.getByText('Your scores are waiting').waitFor({ timeout: 30_000 });
  await captureViewport(page, '06-tease');

  // --- Unlocked results (02) with jawline + skin ---
  console.log('flow: unlocked results');
  await resetApp(page, `ss_unlocked_${Date.now()}`);
  await runOnboardingToPaywall(page, { skin: true });
  await unlockPaywall(page);
  await injectHeroPhoto(page);
  await seedSecondScan(page);
  await page.addStyleTag({
    content: `
      [role="tablist"], nav { opacity: 0 !important; pointer-events: none !important; }
    `,
  });
  await captureViewport(page, '02-traits');

  // Streak (05) — open streak chip
  console.log('flow: streak');
  await page.getByText(/Day \d+/).first().click();
  await page.getByText('Your streak').waitFor({ timeout: 15_000 });
  await sleep(800);
  await captureViewport(page, '05-streak');
  await page.getByText('‹ Back').click();
  await page.getByText(/Your baseline/).first().waitFor({ timeout: 15_000 });

  // Practice → Jawline workout (04)
  console.log('flow: plan');
  await safeClick(page.getByText('Practice', { exact: true }));
  await page.getByText(/Jawline/i).first().waitFor({ timeout: 15_000 });
  // Card renders a PressableScale with accessibilityRole="button"; the inner Text
  // node is not the press handler, so target the button ancestor.
  const jawCard = page.getByRole('button').filter({ hasText: 'Jawline workout' });
  await safeClick(jawCard);
  await page.getByText(/Mark session complete|Session complete/i).waitFor({ timeout: 20_000 });
  await sleep(1500);
  await captureViewport(page, '04-plan');
  await page.getByText('‹ Back').click();

  // Ratings → Compare (03)
  console.log('flow: compare');
  await safeClick(page.getByText('Ratings', { exact: true }));
  await page.getByText('Every scan').waitFor({ timeout: 15_000 });
  await safeClick(page.getByText('Compare', { exact: true }));
  await page.getByText('By trait').waitFor({ timeout: 20_000 });
  await sleep(800);
  await captureViewport(page, '03-progress');

  await context.close();
}

async function composeAll(browser) {
  await mkdir(WORK, { recursive: true });
  await mkdir(OUT_65, { recursive: true });
  await mkdir(OUT_69, { recursive: true });

  const heroPath = path.join(ROOT, 'assets/images/onboarding-face-scan-image1-upscaled.jpg');
  const heroDataUrl = await fileToDataUrl(heroPath);

  // 01-hero is hand-composed HTML, not a live app capture, so regenerating the
  // app does NOT update it. It previously carried hardcoded "Top 45% of men"
  // copy that survived the in-app reframe. Fail loudly rather than ship a
  // screenshot that reintroduces the guideline 1.1.1 framing.
  {
    const heroMarkup = heroPhoneInner('') + JSON.stringify(COPY);
    const banned = heroMarkup.match(/of men|Top \d+%|how hot|honest (face )?rating/gi);
    if (banned) {
      throw new Error(
        `Composed screenshot copy still ranks the user against other people: ${[...new Set(banned)].join(', ')}`,
      );
    }
  }

  // 01 hero — custom full-bleed composite
  {
    const c = COPY['01-hero'];
    const html = marketingShell({
      ...c,
      phoneInner: heroPhoneInner(heroDataUrl),
      phoneClass: 'bleed-bottom',
      extraStyle: `
        .phone-wrap { top: 480px; }
        .phone { width: 1040px; height: 2140px; border-radius: 78px; }
      `,
    });
    await writeFile(path.join(WORK, '01-hero.html'), html);
    await renderHtmlToPng(browser, html, path.join(OUT_65, '01-hero.png'));
  }

  const appShots = [
    {
      id: '02-traits',
      yOffset: -10,
      scale: 1.0,
      hideBottom: 160,
      phoneTop: 520,
    },
    {
      id: '03-progress',
      yOffset: -30,
      scale: 1.0,
      hideBottom: 80,
      phoneTop: 520,
    },
    {
      id: '04-plan',
      yOffset: -20,
      scale: 1.0,
      hideBottom: 40,
      phoneTop: 520,
    },
    {
      id: '05-streak',
      yOffset: -20,
      scale: 1.0,
      hideBottom: 80,
      phoneTop: 520,
    },
    {
      id: '06-tease',
      yOffset: -10,
      scale: 1.0,
      hideBottom: 160,
      phoneTop: 520,
    },
  ];

  for (const shot of appShots) {
    const rawPath = path.join(RAW, `${shot.id}.png`);
    if (!existsSync(rawPath)) {
      console.warn('missing raw capture', shot.id);
      continue;
    }
    const imgDataUrl = await fileToDataUrl(rawPath);
    const c = COPY[shot.id];
    const html = marketingShell({
      ...c,
      phoneInner: appPhoneInner(imgDataUrl, shot),
      phoneClass: 'bleed-bottom',
      extraStyle: `
        .phone-wrap { top: ${shot.phoneTop}px; }
      `,
    });
    await writeFile(path.join(WORK, `${shot.id}.html`), html);
    await renderHtmlToPng(browser, html, path.join(OUT_65, `${shot.id}.png`));
  }

  // Scale 6.5 → 6.9
  for (const id of Object.keys(COPY)) {
    const src = path.join(OUT_65, `${id}.png`);
    if (!existsSync(src)) continue;
    await scalePngWithCss(browser, src, path.join(OUT_69, `${id}.png`), W_69, H_69);
  }
}

async function main() {
  let expoChild = null;
  try {
    expoChild = await ensureExpo();
    // Give metro a moment after port opens
    await sleep(3000);

    const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM_PATH || undefined });
    console.log('Capturing app screens…');
    await captureAll(browser);
    console.log('Compositing marketing frames…');
    await composeAll(browser);
    await browser.close();
    console.log('Done.');
    console.log('en-US →', OUT_65);
    console.log('en-US-6.9in →', OUT_69);
  } finally {
    if (expoChild) {
      expoChild.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
