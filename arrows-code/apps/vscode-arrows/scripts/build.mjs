#!/usr/bin/env node
// Build pipeline: vite (multi-entry main+embed) → copy to media/embed → rewrite CSS asset URLs → esbuild extension.
import { execSync } from 'node:child_process';
import { build } from 'esbuild';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(__dirname, '..');
const repoRoot = resolve(extRoot, '..', '..', '..');

console.log('▸ building arrows-ts (embed entry)…');
// --emptyOutDir: Vite preserves prior outputs by default — stale hashed bundles bloat the .vsix.
execSync('npx vite build --outDir ../../dist/apps/arrows-ts --emptyOutDir', {
  cwd: resolve(repoRoot, 'apps/arrows-ts'),
  stdio: 'inherit',
  env: { ...process.env, BUILD_EMBED: '1' },
});

const embedSrc = resolve(repoRoot, 'dist/apps/arrows-ts');
const embedDst = resolve(extRoot, 'media/embed');
if (!existsSync(resolve(embedSrc, 'embed.html'))) {
  throw new Error(`embed.html missing at ${embedSrc} — arrows-ts build did not produce it`);
}
if (existsSync(embedDst)) rmSync(embedDst, { recursive: true, force: true });
cpSync(embedSrc, embedDst, { recursive: true });
console.log(`▸ copied embed bundle → ${embedDst}`);

// Vite emits absolute `url(/assets/...)` in CSS, which fails under VS Code's
// webview origin where `/` isn't a localResourceRoot. Rewrite to relative URLs.
function rewriteCssAssetUrls(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { rewriteCssAssetUrls(full); continue; }
    if (!name.endsWith('.css')) continue;
    const text = readFileSync(full, 'utf8');
    const rewritten = text.replace(/url\(\/assets\/([^)]+)\)/g, 'url(./$1)');
    if (rewritten !== text) writeFileSync(full, rewritten);
  }
}
rewriteCssAssetUrls(resolve(embedDst, 'assets'));
console.log('▸ rewrote absolute /assets/ URLs in embed CSS to relative');

// Strip dead weight from the Semantic UI fonts/icons:
//  - brand-icons-* (Twitter/Facebook glyphs) — unused anywhere in the embed
//  - .eot / .ttf / .svg legacy font formats — VS Code's webview is Chromium,
//    only .woff2 (and .woff as fallback) ever resolves
// Net: ~1.6MB smaller embed bundle, faster first-paint when a .arrows opens.
import { unlinkSync } from 'node:fs';
function stripDeadFontAssets(dir) {
  const drop = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) continue;
    if (name.startsWith('brand-icons-')) drop.push(full);
    else if (/^(outline-)?icons-.*\.(eot|ttf|svg)$/.test(name)) drop.push(full);
  }
  for (const p of drop) unlinkSync(p);
  return drop.length;
}
const droppedFontFiles = stripDeadFontAssets(resolve(embedDst, 'assets'));
console.log(`▸ stripped ${droppedFontFiles} unused Semantic UI font assets (brand-icons + .eot/.ttf/.svg)`);

// Also strip the @font-face src URLs we just deleted so the browser doesn't
// 404-spam the console looking for them.
function stripDeadFontReferences(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { stripDeadFontReferences(full); continue; }
    if (!name.endsWith('.css')) continue;
    const text = readFileSync(full, 'utf8');
    // Drop entire @font-face blocks whose ONLY src references vanished files —
    // simpler: drop the individual url() entries that point at .eot/.ttf/.svg
    // or any brand-icons file. The .woff2 entry remains, keeping the @font-face valid.
    const rewritten = text
      .replace(/url\(\.\/brand-icons-[^)]+\)\s+format\([^)]+\),?\s*/g, '')
      .replace(/url\(\.\/(outline-)?icons-[^)]+\.(eot|ttf|svg)[^)]*\)\s+format\([^)]+\),?\s*/g, '')
      // Clean up dangling commas left in the src: list.
      .replace(/,\s*;/g, ';')
      .replace(/,\s*}/g, '}');
    if (rewritten !== text) writeFileSync(full, rewritten);
  }
}
stripDeadFontReferences(resolve(embedDst, 'assets'));
console.log('▸ cleaned dead font references from embed CSS');

// Vite copies the web app's public/ into the embed output (index.html,
// manifest.json, cookiebot.external.min.css, the duplicate "favicon copy.ico",
// etc). The webview only loads embed.html — drop the rest.
const webAppOnlyFiles = [
  'index.html',
  'manifest.json',
  'arrows_logo.svg',
  'favicon copy.ico',
  'css',
];
for (const name of webAppOnlyFiles) {
  const path = resolve(embedDst, name);
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
}
console.log('▸ pruned web-app-only assets from embed bundle');

// Copy fixture examples so the sidebar's "Examples" section finds them.
const examplesSrc = resolve(repoRoot, 'arrows-code/fixtures/examples');
const examplesDst = resolve(extRoot, 'media/examples');
if (existsSync(examplesDst)) rmSync(examplesDst, { recursive: true, force: true });
cpSync(examplesSrc, examplesDst, { recursive: true });
console.log(`▸ copied examples → ${examplesDst}`);

await build({
  entryPoints: [resolve(extRoot, 'src/extension.ts')],
  bundle: true,
  outfile: resolve(extRoot, 'dist/extension.js'),
  external: ['vscode', 'canvas', 'bufferutil', 'utf-8-validate'],
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  logLevel: 'warning',
});

const stalePkgDir = resolve(extRoot, 'dist/node_modules');
if (existsSync(stalePkgDir)) rmSync(stalePkgDir, { recursive: true, force: true });

console.log('▸ extension bundle built');
