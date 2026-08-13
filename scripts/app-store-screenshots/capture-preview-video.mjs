/**
 * Record the App Store preview video (Expo web + Playwright), then transcode to
 * Apple's spec with ffmpeg.
 *
 * Apple's accepted app-preview resolution for iPhone 6.9"/6.5" is 886x1920
 * portrait — NOT the device resolution used for screenshots. Length must be
 * 15-30s, H.264, max 30fps, .mov/.m4v/.mp4.
 * https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications/
 *
 * Onboarding is deliberately not in the recording: a first "setup" context runs
 * onboarding + unlock + seeds scan history, its storage is exported, and a second
 * context is created from that state with recording enabled. The video therefore
 * opens straight on Results.
 *
 * Usage (from repo root):
 *   node scripts/app-store-screenshots/capture-preview-video.mjs
 */
import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(ROOT, 'docs/app-store-screenshots/preview');
const WORK = path.join(ROOT, 'docs/app-store-screenshots/_work/video');
const PORT = 19006;
const BASE = `http://localhost:${PORT}`;

// Playwright records at VIEWPORT size and does not scale the page up to
// recordVideo.size, and deviceScaleFactor is ignored for video. Setting a larger
// recordVideo.size therefore parks the page in the top-left corner of the frame
// and pads the rest grey — so record at exactly the viewport size and upscale in
// ffmpeg instead.
//
// The viewport must stay at the app's design width (a 6.9" phone is ~440x956 CSS
// px); rendering natively at 886 wide would halve every font size relative to the
// screen. 443x960 is the same 19.5:9 aspect as the 886x1920 output.
const VIEW_W = 443;
const VIEW_H = 960;
const OUT_W = 886;
const OUT_H = 1920;
const MAX_SECONDS = 29;

const STORAGE_KEYS = [
  'scan-store-v1',
  'practice-v1',
  'streak-v1',
  'onboarding-v1',
  'app-onboarded-v1',
  'render-cache-v1',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  child.stdout.on('data', (b) => process.stdout.write(b.toString()));
  child.stderr.on('data', (b) => process.stdout.write(b.toString()));
  for (let i = 0; i < 90; i++) {
    if (await portOpen(PORT)) {
      console.log('Expo ready');
      return child;
    }
    await sleep(2000);
  }
  throw new Error('Expo web failed to start within 3 minutes');
}

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

async function runOnboardingToPaywall(page) {
  await page.getByText('Scan my face').click();
  await page.getByText('How old are you?').waitFor();
  await page.getByText('25–34').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText('What would you like to work on?').waitFor();
  await page.getByText('Sharper jawline').click();
  await page.getByText('Better skin').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText(/held you back/i).waitFor();
  await page.getByText("Didn't know where to start").click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText('Most guys land between 4 and 7').waitFor();
  await page.getByText('Got it', { exact: true }).click();

  await page.getByText('When do you want to see your first results?').waitFor();
  await page.getByText('In 1 month').click();
  await page.getByText('Continue', { exact: true }).click();

  await page.getByText('How far do you want to go?').waitFor();
  await page.getByText('A noticeable step up').click();
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
  const testPurchase = page.getByRole('button', { name: 'Test valid purchase' });
  await testPurchase.waitFor({ timeout: 30_000 });
  await testPurchase.click();
  await page.getByText(/Top \d+% of men/).first().waitFor({ timeout: 90_000 });
}

async function seedSecondScan(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('scan-store-v1');
    if (!raw) return;
    const store = JSON.parse(raw);
    if (!store.scans?.length) return;
    const latest = store.scans[0];
    const older = {
      id: 'scan-older',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      scores: latest.scores.map((s) => ({ ...s, percentile: Math.max(5, s.percentile - 10) })),
      photoUri: latest.photoUri,
    };
    store.scans = [latest, older];
    store.hasRealScan = true;
    localStorage.setItem('scan-store-v1', JSON.stringify(store));
  });
}

async function useHeroPhoto(page) {
  const heroUrl = `${BASE}/e2e/hero-model.jpg`;
  await page.evaluate(async (url) => {
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = url;
    });
    const raw = localStorage.getItem('scan-store-v1');
    if (!raw) return;
    const store = JSON.parse(raw);
    for (const scan of store.scans ?? []) scan.photoUri = url;
    localStorage.setItem('scan-store-v1', JSON.stringify(store));
  }, heroUrl);
}

/** Slow, readable scroll so the recording does not look like a jump cut. */
async function glide(page, totalPx, steps = 14, pause = 55) {
  const step = Math.round(totalPx / steps);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, step);
    await sleep(pause);
  }
}

async function hideScrollbars(page) {
  await page.addStyleTag({
    content: `*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}`,
  });
}

/** The recorded tour. Target ~27s so the encode lands inside Apple's 15-30s window. */
async function runTour(page) {
  await page.getByText(/Top \d+% of men/).first().waitFor({ timeout: 90_000 });
  await hideScrollbars(page);
  await sleep(2200); // hero: overall ring + photo

  await glide(page, 900); // trait grid
  await sleep(1800);

  // Trait detail: gauge, percentile, score timeline
  await safeClick(page.getByRole('button').filter({ hasText: /Jawline/ }));
  await sleep(2600);
  await glide(page, 500, 10);
  await sleep(1600);
  await safeClick(page.getByText('‹ Back'));
  await sleep(600);

  // Practice → jawline workout tutorial
  await safeClick(page.getByText('Practice', { exact: true }));
  await sleep(1400);
  await safeClick(page.getByRole('button').filter({ hasText: 'Jawline workout' }));
  await sleep(2200);
  await glide(page, 600, 10);
  await sleep(1600);
  await safeClick(page.getByText('‹ Back'));
  await sleep(600);

  // Ratings → before/after compare, held as the closing beat
  await safeClick(page.getByText('Ratings', { exact: true }));
  await sleep(1400);
  await safeClick(page.getByText('Compare', { exact: true }));
  await sleep(2600);
  await glide(page, 400, 8);
  await sleep(2400);
}

function ffmpeg(args) {
  const res = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(`ffmpeg failed (${res.status}):\n${(res.stderr || '').slice(-1800)}`);
  }
}

async function main() {
  const expo = await ensureExpo();
  await rm(WORK, { recursive: true, force: true });
  await mkdir(WORK, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const userId = `preview_${Date.now()}`;

  // --- Setup context (not recorded): onboarding, purchase, scan history ---
  console.log('setup: onboarding + unlock (not recorded)');
  const setupCtx = await browser.newContext({
    viewport: { width: VIEW_W, height: VIEW_H },
    deviceScaleFactor: 2,
  });
  const setup = await setupCtx.newPage();
  setup.setDefaultTimeout(45_000);
  await setup.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await setup.evaluate(
    ([id, keys]) => {
      localStorage.clear();
      for (const k of keys) localStorage.removeItem(k);
      sessionStorage.setItem('e2e_app_user_id', id);
    },
    [userId, STORAGE_KEYS],
  );
  await setup.reload({ waitUntil: 'domcontentloaded' });
  await setup.getByText('Scan my face').waitFor({ timeout: 60_000 });

  await runOnboardingToPaywall(setup);
  await unlockPaywall(setup);
  await seedSecondScan(setup);
  await useHeroPhoto(setup);

  const state = await setupCtx.storageState();
  await setupCtx.close();
  console.log('setup: state captured');

  // --- Recording context: starts already unlocked, on Results ---
  console.log('recording tour…');
  const recCtx = await browser.newContext({
    viewport: { width: VIEW_W, height: VIEW_H },
    deviceScaleFactor: 2,
    storageState: state,
    recordVideo: { dir: WORK, size: { width: VIEW_W, height: VIEW_H } },
  });
  await recCtx.addInitScript((id) => {
    sessionStorage.setItem('e2e_app_user_id', id);
  }, userId);
  // Video recording starts when the context is created, so the blank page load
  // and app boot land at the head of the file. Measure that lead-in and trim it
  // in the transcode, otherwise the preview opens on a white frame (and Apple's
  // default poster frame at 5s can land on it).
  const videoStart = Date.now();
  const page = await recCtx.newPage();
  page.setDefaultTimeout(45_000);
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.getByText(/Top \d+% of men/).first().waitFor({ timeout: 90_000 });
  const leadInSec = (Date.now() - videoStart) / 1000;
  console.log(`lead-in to trim: ${leadInSec.toFixed(2)}s`);

  await runTour(page);

  await recCtx.close(); // flushes the .webm
  await browser.close();
  if (expo) expo.kill();

  const files = (await readdir(WORK)).filter((f) => f.endsWith('.webm'));
  if (!files.length) throw new Error('no video produced');
  const src = path.join(WORK, files[0]);
  const out = path.join(OUT_DIR, 'axend-preview-6.9.mp4');

  console.log('transcoding to Apple spec…');
  // Exact 886x1920, H.264 High@4.0, 30fps, ~11Mbps, plus a silent stereo AAC
  // track — App Store Connect expects an enabled audio track.
  ffmpeg([
    '-y',
    '-ss', leadInSec.toFixed(2),
    '-i', src,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-t', String(MAX_SECONDS),
    // Lanczos upscale from the design-width capture, with light unsharp to
    // recover edge definition on text.
    '-vf', `scale=${OUT_W}:${OUT_H}:flags=lanczos,unsharp=5:5:0.6:5:5:0.0,fps=30,format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level:v', '4.0',
    '-b:v', '11M', '-maxrate', '12M', '-bufsize', '24M',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '44100', '-ac', '2',
    '-shortest', '-movflags', '+faststart',
    out,
  ]);

  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
     'stream=width,height,r_frame_rate,codec_name:format=duration,size', '-of', 'default=nw=1', out],
    { encoding: 'utf8' },
  );
  const info = (probe.stdout || '').trim();
  console.log('\n' + info);

  const dur = Number(/duration=([\d.]+)/.exec(info)?.[1] ?? 0);
  const w = Number(/width=(\d+)/.exec(info)?.[1] ?? 0);
  const h = Number(/height=(\d+)/.exec(info)?.[1] ?? 0);
  const problems = [];
  if (w !== OUT_W || h !== OUT_H) problems.push(`expected ${OUT_W}x${OUT_H}, got ${w}x${h}`);
  if (dur < 15 || dur > 30) problems.push(`duration ${dur}s outside Apple's 15-30s window`);

  // Guard against the page being letterboxed inside a larger frame: sample the
  // bottom-right corner, which is grey padding when the capture does not fill
  // the frame. Cropping there and measuring the frame's mean luma is enough —
  // this app is a near-black dark UI, padding is mid-grey.
  const luma = spawnSync(
    'ffmpeg',
    ['-v', 'error', '-ss', '2', '-i', out, '-frames:v', '1',
     '-vf', `crop=${Math.floor(OUT_W / 3)}:${Math.floor(OUT_H / 3)}:${OUT_W - Math.floor(OUT_W / 3)}:${OUT_H - Math.floor(OUT_H / 3)},signalstats,metadata=print:key=lavfi.signalstats.YAVG`,
     '-f', 'null', '-'],
    { encoding: 'utf8' },
  );
  const yavg = Number(/YAVG=([\d.]+)/.exec(luma.stderr || luma.stdout || '')?.[1] ?? 0);
  if (yavg > 90) problems.push(`bottom-right corner luma ${yavg} looks like grey padding, not app UI`);

  if (problems.length) {
    console.error('\nFAILED CHECKS:\n- ' + problems.join('\n- '));
    process.exit(1);
  }
  console.log(`corner luma ${yavg} (dark UI, frame is filled)`);
  console.log('\npreview →', out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
