import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = 'com.anonymous.looxmaxxing';
const ADB = process.env.ANDROID_HOME
  ? join(process.env.ANDROID_HOME, 'platform-tools', 'adb.exe')
  : 'adb';
const OUT = join(__dirname, 'android-runs', String(Date.now()));
mkdirSync(OUT, { recursive: true });

function adb(args, opts = {}) {
  const cmd = `"${ADB}" ${args}`;
  return execSync(cmd, { encoding: 'utf8', stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function parseBounds(bounds) {
  const m = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!m) return null;
  const x1 = +m[1];
  const y1 = +m[2];
  const x2 = +m[3];
  const y2 = +m[4];
  return { x: Math.floor((x1 + x2) / 2), y: Math.floor((y1 + y2) / 2) };
}

function dumpUi(tag) {
  adb('shell uiautomator dump /sdcard/ui.xml', { silent: true });
  const local = join(OUT, `${tag}.xml`);
  adb(`pull /sdcard/ui.xml "${local}"`, { silent: true });
  return readFileSync(local, 'utf8');
}

function findNodes(xml, matcher) {
  const nodes = [];
  const re = /<node [^>]*>/g;
  let m;
  while ((m = re.exec(xml))) {
    const tag = m[0];
    if (!matcher(tag)) continue;
    const text = (tag.match(/text="([^"]*)"/) || [])[1] ?? '';
    const desc = (tag.match(/content-desc="([^"]*)"/) || [])[1] ?? '';
    const rid = (tag.match(/resource-id="([^"]*)"/) || [])[1] ?? '';
    const bounds = (tag.match(/bounds="([^"]*)"/) || [])[1] ?? '';
    const enabled = !tag.includes('enabled="false"');
    const clickable = tag.includes('clickable="true"');
    nodes.push({ text, desc, rid, bounds, enabled, clickable, tag });
  }
  return nodes;
}

function tapRaw(x, y, label = 'raw') {
  console.log(`tap ${label} @ ${x},${y}`);
  adb(`shell input tap ${x} ${y}`, { silent: true });
}

function tapNode(node, label) {
  const pt = parseBounds(node.bounds);
  if (!pt) throw new Error(`no bounds for ${label}`);
  tapRaw(pt.x, pt.y, label);
}

function tapBy(label, opts = {}) {
  const { partial = false, rid = null, timeout = 45000, interval = 800 } = opts;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const xml = dumpUi(`find-${String(label).replace(/\W+/g, '_')}`);
    const nodes = findNodes(xml, (tag) => {
      if (rid && (tag.match(/resource-id="([^"]*)"/) || [])[1]?.includes(rid)) return true;
      const text = (tag.match(/text="([^"]*)"/) || [])[1] ?? '';
      const desc = (tag.match(/content-desc="([^"]*)"/) || [])[1] ?? '';
      const hay = `${text} ${desc}`;
      if (partial) return hay.toLowerCase().includes(String(label).toLowerCase());
      return text === label || desc === label;
    }).filter((n) => n.clickable && n.enabled);
    if (nodes.length) {
      tapNode(nodes[0], label);
      return;
    }
    sleep(interval);
  }
  const xml = dumpUi('timeout');
  writeFileSync(join(OUT, 'timeout.xml'), xml);
  throw new Error(`timeout waiting to tap: ${label}`);
}

function tapOneOf(labels) {
  for (const label of labels) {
    try {
      tapBy(label);
      return;
    } catch {
      /* try next label variant */
    }
  }
  throw new Error(`timeout waiting to tap any of: ${labels.join(', ')}`);
}

function tapUntilSeen(tapLabel, seenText, opts = {}) {
  const { tapPartial = false, seenPartial = false, attempts = 6 } = opts;
  for (let i = 0; i < attempts; i++) {
    tapBy(tapLabel, { partial: tapPartial, timeout: 12000 });
    sleep(1200);
    if (waitForTextOptional(seenText, { partial: seenPartial, timeout: 6000 })) return;
    console.log(`retry tap ${tapLabel} (${i + 2}/${attempts})`);
  }
  throw new Error(`gave up: tap ${tapLabel} → ${seenText}`);
}

function waitForText(text, opts = {}) {
  if (!waitForTextOptional(text, opts)) {
    throw new Error(`timeout waiting for text: ${text}`);
  }
}

function waitForTextOptional(text, opts = {}) {
  const { partial = false, timeout = 60000, interval = 800 } = opts;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const xml = dumpUi(`wait-${text.replace(/\W+/g, '_')}`);
    const nodes = findNodes(xml, (tag) => {
      const t = (tag.match(/text="([^"]*)"/) || [])[1] ?? '';
      const d = (tag.match(/content-desc="([^"]*)"/) || [])[1] ?? '';
      const hay = `${t} ${d}`;
      return partial
        ? hay.toLowerCase().includes(text.toLowerCase())
        : t === text || d === text;
    });
    if (nodes.length) {
      console.log(`seen: ${text}`);
      return true;
    }
    sleep(interval);
  }
  return false;
}

function screenshot(tag) {
  const path = join(OUT, `${tag}.png`);
  execSync(`"${ADB}" exec-out screencap -p > "${path}"`, { shell: true, stdio: 'pipe' });
  console.log(`screenshot ${path}`);
}

console.log('=== Android emulator E2E ===');
console.log(`output ${OUT}`);

adb(`shell pm clear ${PKG}`, { silent: true });
sleep(1000);
adb(`shell monkey -p ${PKG} -c android.intent.category.LAUNCHER 1`, { silent: true });
sleep(5000);

waitForText('How old are you?');
tapBy('25–34');
sleep(400);
tapBy('Continue');
sleep(600);

waitForText('Get an honest read on your face');
sleep(1500);
function tapWelcomeCta() {
  const xml = dumpUi('welcome-cta');
  const nodes = findNodes(xml, (tag) => {
    if (!tag.includes('clickable="true"') || tag.includes('enabled="false"')) return false;
    const desc = (tag.match(/content-desc="([^"]*)"/) || [])[1] ?? '';
    const text = (tag.match(/text="([^"]*)"/) || [])[1] ?? '';
    const hay = `${text} ${desc}`.toLowerCase();
    return hay.includes('start') && !hay.includes('debugger');
  });
  if (nodes.length) {
    tapNode(nodes[0], 'welcome-cta');
    return;
  }
  tapRaw(540, 2100, 'welcome-cta-fallback');
}
for (let i = 0; i < 6; i++) {
  tapWelcomeCta();
  sleep(1200);
  if (waitForTextOptional('What would you like to work on?', { partial: true, timeout: 5000 })) break;
  if (i === 5) throw new Error('stuck on welcome');
}

waitForText('What would you like to work on?');
tapBy('Sharper jawline');
sleep(400);
tapBy('Continue');
sleep(600);

tapBy('Skip');
sleep(600);

waitForText('Most guys land between 4 and 7');
tapBy('Got it');
sleep(600);

waitForText('Front photo');
tapBy('Use test photo');
sleep(1200);

waitForText('analysis is ready', { partial: true });
tapBy('Unlock my results');
sleep(2500);

// RevenueCat surfaces a native "Test Store Purchase" dialog on dev builds
// (no Play Store billing). Dismiss it with the valid-purchase path so the
// simulated entitlement grants and the scan API's server-side gate unlocks.
if (waitForTextOptional('TEST VALID PURCHASE', { timeout: 15000 })) {
  tapBy('TEST VALID PURCHASE');
  sleep(1500);
}

try {
  waitForText('Analyzing your photos', { partial: true, timeout: 20000 });
} catch {
  /* dev fallback can skip analyzing screen */
}

if (!waitForTextOptional('Top', { partial: true, timeout: 30000 })) {
  tapBy('Your scores are waiting', { partial: true });
  sleep(800);
  tapBy('Unlock my results');
  sleep(2500);
  try {
    waitForText('Analyzing your photos', { partial: true, timeout: 20000 });
  } catch {
    /* ok */
  }
  waitForText('Top', { partial: true, timeout: 90000 });
}
screenshot('results');

tapBy('Avatars');
sleep(800);

waitForText('Preview your potential');
tapBy('A sharper jawline', { partial: true });
sleep(3000);

waitForText('styling preview', { partial: true, timeout: 60000 });
screenshot('avatar-render');

console.log('=== PASS: full emulator cycle complete ===');