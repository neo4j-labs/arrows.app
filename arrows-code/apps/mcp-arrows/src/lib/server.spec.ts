import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import { renderArrows } from './tools';

/**
 * MCP tool contract — verifies the shape we hand back to the protocol matches
 * what Claude expects: image content base64 + parseable inner SVG.
 */
describe('MCP image content contract', () => {
  // render_arrows is now the only render tool. Its result must work both as
  // an MCP image content block (image clients) AND as a JSON text block that
  // includes the SVG string (programmatic clients) — folding render_arrows_svg
  // back into the same tool. Both modes share the same upstream renderer.
  it('renderArrows result can be wrapped as an MCP image block (svg → base64)', async () => {
    const text = readFileSync(
      resolve(__dirname, '../../../../fixtures/examples/social.arrows'),
      'utf8'
    );
    const { svg } = await renderArrows({ graph: text });
    const data = Buffer.from(svg, 'utf8').toString('base64');

    // base64 is non-empty and decodes back to the original SVG string.
    expect(data.length).toBeGreaterThan(0);
    expect(Buffer.from(data, 'base64').toString('utf8')).toBe(svg);

    // The decoded payload is a real SVG document.
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toMatch(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });
});
