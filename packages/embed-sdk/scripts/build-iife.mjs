import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(root, '../../client/public');
const outFile = path.join(outDir, 'embed-sdk.js');

await mkdir(outDir, { recursive: true });

const result = await esbuild.build({
  entryPoints: [path.join(root, 'src/index.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'EmbedSDK',
  platform: 'browser',
  target: 'es2020',
  outfile: outFile,
  minify: true,
});

if (result.errors.length > 0) {
  process.exit(1);
}

await writeFile(
  path.join(outDir, 'embed-sdk.d.ts'),
  `declare const EmbedSDK: {
  createEmbedClient: typeof import('@browser-basics/embed-sdk').createEmbedClient;
};
`,
);

console.log(`Wrote ${outFile}`);
