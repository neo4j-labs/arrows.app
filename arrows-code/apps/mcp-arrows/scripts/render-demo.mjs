#!/usr/bin/env node
/**
 * Visual sanity check. Renders the social fixture via the built MCP server's
 * SVG path and writes the result to dist/demo/ for a human to eyeball parity
 * with arrows.app. Opt-in dev tool — not part of the test suite (renderer
 * parity is exercised in libs/renderer-host/*.spec.ts).
 *
 * Run: node apps/mcp-arrows/scripts/render-demo.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');
const OUT_DIR = resolve(ROOT, 'arrows-code/dist/demo');

const { renderArrows } = await import(resolve(__dirname, '..', 'dist', 'lib', 'tools.js'));

const text = readFileSync(resolve(ROOT, 'arrows-code/fixtures/examples/social.arrows'), 'utf8');
const { svg, width, height } = await renderArrows({ graph: text });

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(resolve(OUT_DIR, 'demo.svg'), svg);
writeFileSync(
  resolve(OUT_DIR, 'viewer.html'),
  `<!doctype html>
<html><head><meta charset="utf-8"><title>arrows-code demo</title>
<style>
  body { font-family: -apple-system, sans-serif; margin: 0; padding: 2rem; background: #fafafa; }
  h1 { font-size: 1.1rem; color: #444; margin: 0 0 1rem; }
  .meta { color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; }
  .frame { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1rem; display: inline-block; }
  svg { max-width: 90vw; height: auto; }
</style></head>
<body>
  <h1>arrows-code demo — social graph (rendered via MCP path)</h1>
  <div class="meta">Source: <code>arrows-code/fixtures/examples/social.arrows</code> · Pipeline: <code>format-json → renderer-host → SVG</code> · Size: ${width}×${height}</div>
  <div class="frame">${svg}</div>
</body></html>`,
);

process.stdout.write(`\n  ▸ Open: ${resolve(OUT_DIR, 'viewer.html')}\n\n`);
