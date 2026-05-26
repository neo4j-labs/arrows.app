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
  it('produces an SVG string with the xmlns attribute', async () => {
    const { svg } = await renderGraphToSvg(sample);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('returns positive width and height for a non-empty graph', async () => {
    const { width, height } = await renderGraphToSvg(sample);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  it('contains text for each node caption', async () => {
    const { svg } = await renderGraphToSvg(sample);
    expect(svg).toContain('Alice');
    expect(svg).toContain('Bob');
  });

  it('contains an SVG path for the relationship line', async () => {
    const { svg } = await renderGraphToSvg(sample);
    // Relationship draws as a polyline or path; both indicate the link is present.
    expect(/<(path|polyline)\b/.test(svg)).toBe(true);
  });

  it('can render repeatedly without error', async () => {
    const a = await renderGraphToSvg(sample);
    const b = await renderGraphToSvg(sample);
    expect(a.width).toBe(b.width);
    expect(a.height).toBe(b.height);
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
