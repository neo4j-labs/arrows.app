/**
 * Visual end-to-end demo. Renders the social-graph fixture via the same code
 * path the MCP server uses, then writes the SVG (plus a small HTML viewer)
 * to dist/demo/ so a human can open it and confirm parity with arrows.app.
 *
 * Run: npx nx test arrows-code-mcp-arrows -- demo
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderArrows } from './tools';

const ROOT = resolve(__dirname, '../../../../..');
const OUT_DIR = resolve(ROOT, 'arrows-code/dist/demo');

describe('end-to-end visual demo', () => {
  it('renders social.arrows → demo.svg + viewer.html', async () => {
    const text = readFileSync(resolve(ROOT, 'arrows-code/fixtures/examples/social.arrows'), 'utf8');
    const { svg, width, height, diagnostics } = await renderArrows({ graph: text });

    expect(diagnostics).toEqual([]);
    expect(svg).toContain('<svg');
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

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
  });

  afterAll(() => {
    process.stdout.write(`\n  ▸ Open: ${resolve(OUT_DIR, 'viewer.html')}\n\n`);
  });
});
