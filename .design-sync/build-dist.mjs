import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await build({
  entryPoints: [resolve(root, '.design-sync/ds-entry.ts')],
  outfile: resolve(root, 'dist/index.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  alias: { 'react-native': 'react-native-web' },
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
  define: { __DEV__: 'false', 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});

execSync('npx tsc -p .design-sync/tsconfig.dist.json', { cwd: root, stdio: 'inherit' });

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/index.d.ts'), "export * from './types/.design-sync/ds-entry';\n");
console.log('dist/index.js + dist/index.d.ts written');
