import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadAppEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), '.env');
  const out: Record<string, string> = {};
  if (!existsSync(envPath)) return out;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}