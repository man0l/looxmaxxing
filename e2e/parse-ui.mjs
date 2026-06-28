import { readFileSync } from 'node:fs';
const x = readFileSync(process.argv[2], 'utf8');
const re = /<node [^>]*>/g;
let m;
while ((m = re.exec(x))) {
  const t = (m[0].match(/text="([^"]*)"/) || [])[1] ?? '';
  const d = (m[0].match(/content-desc="([^"]*)"/) || [])[1] ?? '';
  if (!t && !d) continue;
  const click = m[0].includes('clickable="true"') ? ' [click]' : '';
  console.log(JSON.stringify(t || d) + click);
}