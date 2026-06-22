import { describe, expect, it } from 'vitest';
import { LAYOUTS } from './index';
import { forceDirected } from './forceDirected';
import { hierarchical } from './hierarchical';
import { radial } from './radial';
import { circular } from './circular';
import { grid } from './grid';

const node = (id: string, x = 0, y = 0) => ({
  id, position: { x, y }, caption: '', labels: [], properties: {}, style: {},
});
const rel = (id: string, fromId: string, toId: string) => ({
  id, fromId, toId, type: 'KNOWS', properties: {}, style: {},
});

const aliceBob = () => ({
  nodes: [node('a', -50, 0), node('b', 50, 0)],
  relationships: [rel('r0', 'a', 'b')],
  style: {},
});

// Hub-and-spoke shape similar to lexical-graph: 1 center + 4 leaves.
const hubAndSpoke = () => ({
  nodes: [node('hub'), node('l1'), node('l2'), node('l3'), node('l4')],
  relationships: [rel('e1', 'hub', 'l1'), rel('e2', 'hub', 'l2'), rel('e3', 'hub', 'l3'), rel('e4', 'hub', 'l4')],
  style: {},
});

// Simple DAG: a → b → c, a → c.
const dag = () => ({
  nodes: [node('a'), node('b'), node('c')],
  relationships: [rel('r0', 'a', 'b'), rel('r1', 'b', 'c'), rel('r2', 'a', 'c')],
  style: {},
});

describe('LAYOUTS registry', () => {
  it('exposes 5 layouts in a stable order', () => {
    expect(LAYOUTS.map((l) => l.id)).toEqual(['force', 'hierarchical', 'radial', 'circular', 'grid']);
  });

  it.each(LAYOUTS)('$id leaves an empty graph unchanged', async (layout) => {
    const g = { nodes: [], relationships: [], style: {} };
    expect(await layout.run(g)).toEqual(g);
  });

  it.each(LAYOUTS.filter((l) => l.id !== 'grid'))('$id centers a single node at the origin', async (layout) => {
    const g = { nodes: [node('n0', 500, 700)], relationships: [], style: {} };
    const out = await layout.run(g);
    expect(out.nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it.each(LAYOUTS)('$id is deterministic across runs', async (layout) => {
    const g1 = await layout.run(aliceBob());
    const g2 = await layout.run(aliceBob());
    expect(g1.nodes.map((n) => n.position)).toEqual(g2.nodes.map((n) => n.position));
  });

  it.each(LAYOUTS)('$id preserves caption/labels/properties/style on every node', async (layout) => {
    const g = {
      nodes: [
        { id: 'a', position: { x: 0, y: 0 }, caption: 'Alice', labels: ['Person'], properties: { name: "'Alice'" }, style: { 'node-color': '#aabbcc' } },
        { id: 'b', position: { x: 100, y: 0 }, caption: 'Bob', labels: ['Person'], properties: {}, style: {} },
      ],
      relationships: [rel('r0', 'a', 'b')],
      style: { 'background-color': '#ffffff' },
    };
    const out = await layout.run(g);
    expect(out.nodes[0].caption).toBe('Alice');
    expect(out.nodes[0].labels).toEqual(['Person']);
    expect(out.nodes[0].properties).toEqual({ name: "'Alice'" });
    expect(out.nodes[0].style).toEqual({ 'node-color': '#aabbcc' });
    expect(out.style).toEqual({ 'background-color': '#ffffff' });
  });

  it.each(LAYOUTS)('$id tolerates relationships referencing unknown ids', async (layout) => {
    const g = {
      nodes: [node('a'), node('b')],
      relationships: [rel('ghost', 'a', 'missing'), rel('r0', 'a', 'b')],
      style: {},
    };
    await expect(layout.run(g)).resolves.toBeDefined();
  });

  it.each(LAYOUTS)('$id tolerates self-loops without producing NaN positions', async (layout) => {
    const g = { nodes: [node('a'), node('b')], relationships: [rel('r0', 'a', 'a')], style: {} };
    const out = await layout.run(g);
    for (const n of out.nodes) {
      const p = n.position as { x: number; y: number };
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });
});

describe('force-directed specifics', () => {
  it('no pair of nodes ends up closer than the minimum collision distance', async () => {
    const out = await forceDirected({
      nodes: [node('doc'), node('c1'), node('c2'), node('c3'), node('c4'), node('e1'), node('e2'), node('e3'), node('e4')],
      relationships: [
        rel('a1', 'c1', 'doc'), rel('a2', 'c2', 'doc'), rel('a3', 'c3', 'doc'), rel('a4', 'c4', 'doc'),
        rel('b1', 'c1', 'c2'), rel('b2', 'c2', 'c3'), rel('b3', 'c3', 'c4'),
        rel('m1', 'c1', 'e1'), rel('m2', 'c2', 'e2'), rel('m3', 'c3', 'e3'), rel('m4', 'c4', 'e4'),
      ],
      style: {},
    });
    const positions = out.nodes.map((n) => n.position as { x: number; y: number });
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const d = Math.hypot(positions[i].x - positions[j].x, positions[i].y - positions[j].y);
        expect(d).toBeGreaterThanOrEqual(199); // 80+80+40=200; allow 1px rounding
      }
    }
  });
});

describe('hierarchical specifics', () => {
  it('a→b→c places nodes in three distinct layers (increasing y)', async () => {
    const out = await hierarchical(dag());
    const pos = Object.fromEntries(out.nodes.map((n) => [n.id, n.position as { x: number; y: number }]));
    expect(pos.a.y).toBeLessThan(pos.b.y);
    expect(pos.b.y).toBeLessThan(pos.c.y);
  });

  it('a fully cyclic graph still produces finite positions (no infinite layering)', async () => {
    const g = {
      nodes: [node('x'), node('y'), node('z')],
      relationships: [rel('r0', 'x', 'y'), rel('r1', 'y', 'z'), rel('r2', 'z', 'x')],
      style: {},
    };
    const out = await hierarchical(g);
    for (const n of out.nodes) {
      const p = n.position as { x: number; y: number };
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });
});

describe('radial specifics', () => {
  it('the highest-degree node lands at the origin', async () => {
    const out = await radial(hubAndSpoke());
    const hub = out.nodes.find((n) => n.id === 'hub')!.position as { x: number; y: number };
    expect(hub).toEqual({ x: 0, y: 0 });
  });

  it('leaves sit at the same distance from the hub (ring 1)', async () => {
    const out = await radial(hubAndSpoke());
    const dists = out.nodes
      .filter((n) => n.id.startsWith('l'))
      .map((n) => {
        const p = n.position as { x: number; y: number };
        return Math.hypot(p.x, p.y);
      });
    // All should be roughly equal (one ring); allow 1px rounding tolerance.
    for (let i = 1; i < dists.length; i++) {
      expect(Math.abs(dists[i] - dists[0])).toBeLessThan(1);
    }
  });

  it('ring radius scales with node count so chord ≥ node diameter + gap', async () => {
    // Crowded ring: 1 hub + 24 leaves should expand the ring well past RING_GAP
    // so per-node chord length stays ≥ 2*radius + gap (no caption overlap).
    const hub = node('hub');
    const leaves = Array.from({ length: 24 }, (_, i) => node(`l${i}`));
    const rels = leaves.map((l, i) => rel(`e${i}`, 'hub', l.id));
    const out = await radial({ nodes: [hub, ...leaves], relationships: rels, style: {} });
    const positions = out.nodes
      .filter((n) => n.id.startsWith('l'))
      .map((n) => n.position as { x: number; y: number });
    // Each adjacent pair on the ring must be far enough apart that two 80-radius
    // bodies + 40px gap fit between centers.
    positions.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      const b = positions[(i + 1) % positions.length];
      const chord = Math.hypot(a.x - b.x, a.y - b.y);
      expect(chord).toBeGreaterThanOrEqual(199); // 80+80+40 minus 1px rounding
    }
  });
});

describe('circular specifics', () => {
  it('all nodes equidistant from origin', async () => {
    const out = await circular({
      nodes: [node('a'), node('b'), node('c'), node('d')],
      relationships: [],
      style: {},
    });
    const dists = out.nodes.map((n) => {
      const p = n.position as { x: number; y: number };
      return Math.hypot(p.x, p.y);
    });
    for (let i = 1; i < dists.length; i++) {
      expect(Math.abs(dists[i] - dists[0])).toBeLessThan(1);
    }
  });
});

describe('grid specifics', () => {
  it('lays out 9 nodes in a 3×3 grid (sqrt(9)=3 cols)', async () => {
    const out = await grid({
      nodes: Array.from({ length: 9 }, (_, i) => node(`n${i}`)),
      relationships: [],
      style: {},
    });
    // Distinct x values should be exactly 3 (three columns).
    const xs = new Set(out.nodes.map((n) => (n.position as { x: number }).x));
    expect(xs.size).toBe(3);
  });
});
