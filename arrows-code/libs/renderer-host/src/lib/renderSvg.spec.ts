import { describe, expect, it } from 'vitest';
import { Point } from '@neo4j-arrows/model';
import type { Graph } from '@neo4j-arrows/model';
import { renderGraphToSvg } from './renderSvg';

const sample: Graph = {
  style: { 'node-color': '#ffe081' },
  nodes: [
    {
      entityType: 'Node',
      id: 'n0',
      position: new Point(120, 240),
      caption: 'Alice',
      labels: ['Person'],
      properties: { name: "'Alice'" },
      style: {},
    },
    {
      entityType: 'Node',
      id: 'n1',
      position: new Point(320, 240),
      caption: 'Bob',
      labels: ['Person'],
      properties: { name: "'Bob'" },
      style: {},
    },
  ],
  relationships: [
    {
      entityType: 'Relationship',
      id: 'r0',
      fromId: 'n0',
      toId: 'n1',
      type: 'KNOWS',
      properties: {},
      style: {},
    },
  ],
};

describe('renderGraphToSvg', () => {
  it('output is a well-formed SVG root with the correct xmlns', async () => {
    const { svg } = await renderGraphToSvg(sample);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('draws a path or polyline for each relationship', async () => {
    const { svg } = await renderGraphToSvg(sample);
    expect(/<(path|polyline)\b/.test(svg)).toBe(true);
  });

  it('renders an empty graph without throwing and produces a valid <svg> root', async () => {
    const empty: Graph = { nodes: [], relationships: [], style: {} };
    const { svg, nodes } = await renderGraphToSvg(empty);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(nodes).toEqual([]);
  });

  it('renders a single isolated node (no relationships)', async () => {
    const solo: Graph = {
      style: {},
      nodes: [{
        entityType: 'Node', id: 'n0', position: new Point(0, 0),
        caption: 'Solo', labels: [], properties: {}, style: {},
      }],
      relationships: [],
    };
    const { svg, nodes } = await renderGraphToSvg(solo);
    expect(svg).toContain('Solo');
    expect(nodes).toHaveLength(1);
  });

  it('renders a self-loop without throwing', async () => {
    const loop: Graph = {
      style: {},
      nodes: [{
        entityType: 'Node', id: 'n0', position: new Point(0, 0),
        caption: 'Hub', labels: [], properties: {}, style: {},
      }],
      relationships: [{
        entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n0', type: 'LOOP',
        properties: {}, style: {},
      }],
    };
    const { svg } = await renderGraphToSvg(loop);
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('preserves a non-ASCII caption in the rendered text', async () => {
    const unicode: Graph = {
      style: {},
      nodes: [{
        entityType: 'Node', id: 'n0', position: new Point(0, 0),
        caption: 'héllo 北京', labels: [], properties: {}, style: {},
      }],
      relationships: [],
    };
    const { svg } = await renderGraphToSvg(unicode);
    // jsdom serializes the text node; the caption survives even if non-BMP chars are escaped.
    expect(svg).toMatch(/h[eé]llo/);
  });

  it('paints a background rect when graph.style.background-color is set', async () => {
    // Exported SVGs without a background look like hollow line drawings against
    // whatever surface they're pasted into. Mirror what the canvas renderer does.
    const withBg: Graph = {
      style: { 'background-color': '#fafafa' },
      nodes: [{ entityType: 'Node', id: 'n0', position: new Point(0, 0), caption: 'A', labels: [], properties: {}, style: {} }],
      relationships: [],
    };
    const { svg } = await renderGraphToSvg(withBg);
    expect(svg).toContain('<rect width="100%" height="100%" fill="#fafafa"');
  });

  it('does NOT paint a background rect when no background-color is set', async () => {
    const noBg: Graph = {
      style: {},
      nodes: [{ entityType: 'Node', id: 'n0', position: new Point(0, 0), caption: 'A', labels: [], properties: {}, style: {} }],
      relationships: [],
    };
    const { svg } = await renderGraphToSvg(noBg);
    expect(svg).not.toContain('width="100%" height="100%"');
  });

  it('skips the background rect for transparent or none values', async () => {
    for (const value of ['transparent', 'none', '']) {
      const g: Graph = {
        style: { 'background-color': value },
        nodes: [{ entityType: 'Node', id: 'n0', position: new Point(0, 0), caption: 'A', labels: [], properties: {}, style: {} }],
        relationships: [],
      };
      const { svg } = await renderGraphToSvg(g);
      expect(svg).not.toContain('width="100%" height="100%"');
    }
  });

  it('escapes hostile attribute characters in the background-color value', async () => {
    // Defense against a malformed style value breaking out of the fill="..." attr.
    const evil: Graph = {
      style: { 'background-color': '#fff"><script>alert(1)</script>' },
      nodes: [{ entityType: 'Node', id: 'n0', position: new Point(0, 0), caption: 'A', labels: [], properties: {}, style: {} }],
      relationships: [],
    };
    const { svg } = await renderGraphToSvg(evil);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&quot;');
  });

  it('returns SVG-space screen positions for every node', async () => {
    const { nodes, width, height } = await renderGraphToSvg(sample);
    expect(nodes.map((n) => n.id).sort()).toEqual(['n0', 'n1']);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(width);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(height);
    }
  });
});
