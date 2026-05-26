import { describe, expect, it } from 'vitest';
import { Point } from '@neo4j-arrows/model';
import type { Graph } from '@neo4j-arrows/model';
import { writeGraph } from './write';
import { readGraph } from './read';

const sampleGraph = (): Graph => ({
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
  style: { 'node-color': '#ffe081' },
});

describe('writeGraph — output shape', () => {
  it('produces valid JSON', () => {
    expect(() => JSON.parse(writeGraph(sampleGraph()))).not.toThrow();
  });

  it('serializes Point as plain {x, y} (no class instance)', () => {
    const parsed = JSON.parse(writeGraph(sampleGraph()));
    expect(parsed.nodes[0].position).toEqual({ x: 120, y: 240 });
  });

  it('preserves nodes, relationships, and style at the top level', () => {
    const parsed = JSON.parse(writeGraph(sampleGraph()));
    expect(parsed).toHaveProperty('nodes');
    expect(parsed).toHaveProperty('relationships');
    expect(parsed).toHaveProperty('style');
    expect(parsed.nodes).toHaveLength(2);
    expect(parsed.relationships).toHaveLength(1);
  });

  it('omits the entityType discriminator from serialized output', () => {
    const parsed = JSON.parse(writeGraph(sampleGraph()));
    expect(parsed.nodes[0]).not.toHaveProperty('entityType');
    expect(parsed.relationships[0]).not.toHaveProperty('entityType');
  });
});

describe('writeGraph — stability', () => {
  it('is byte-identical across 100 consecutive calls', () => {
    const graph = sampleGraph();
    const first = writeGraph(graph);
    for (let i = 0; i < 99; i++) {
      expect(writeGraph(graph)).toBe(first);
    }
  });

  it('sorts node keys alphabetically for diff-friendly output', () => {
    const graph = sampleGraph();
    const parsed = JSON.parse(writeGraph(graph));
    const keysFirstNode = Object.keys(parsed.nodes[0]);
    expect(keysFirstNode).toEqual([...keysFirstNode].sort());
  });

  it('produces identical output when property insertion order differs', () => {
    const a: Graph = {
      ...sampleGraph(),
      style: { color: '#000', 'node-color': '#fff' },
    };
    const b: Graph = {
      ...sampleGraph(),
      style: { 'node-color': '#fff', color: '#000' },
    };
    expect(writeGraph(a)).toBe(writeGraph(b));
  });
});

describe('round-trip', () => {
  it('readGraph(writeGraph(g)) is structurally equal to g for the sample graph', () => {
    const original = sampleGraph();
    const { graph: roundTripped, diagnostics } = readGraph(writeGraph(original));
    expect(diagnostics).toEqual([]);
    expect(roundTripped.nodes).toHaveLength(original.nodes.length);
    expect(roundTripped.relationships).toHaveLength(original.relationships.length);
    expect(roundTripped.nodes[0].position).toBeInstanceOf(Point);
    expect(roundTripped.nodes[0].position.x).toBe(original.nodes[0].position.x);
    expect(roundTripped.nodes[0].caption).toBe(original.nodes[0].caption);
    expect(roundTripped.relationships[0].fromId).toBe(original.relationships[0].fromId);
    expect(roundTripped.style).toEqual(original.style);
  });

  it('round-trips a self-loop without dropping or rewriting endpoints', () => {
    const loop: Graph = {
      nodes: [{
        entityType: 'Node', id: 'n0', position: new Point(0, 0),
        caption: 'Hub', labels: ['Node'], properties: {}, style: {},
      }],
      relationships: [{
        entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n0', type: 'LOOP', properties: {}, style: {},
      }],
      style: {},
    };
    const { graph } = readGraph(writeGraph(loop));
    expect(graph.relationships[0].fromId).toBe('n0');
    expect(graph.relationships[0].toId).toBe('n0');
    expect(graph.relationships[0].type).toBe('LOOP');
  });

  it('round-trips a multi-edge (two rels between the same pair, different types)', () => {
    const multi: Graph = {
      nodes: [
        { entityType: 'Node', id: 'a', position: new Point(0, 0), caption: 'A', labels: [], properties: {}, style: {} },
        { entityType: 'Node', id: 'b', position: new Point(100, 0), caption: 'B', labels: [], properties: {}, style: {} },
      ],
      relationships: [
        { entityType: 'Relationship', id: 'r0', fromId: 'a', toId: 'b', type: 'KNOWS', properties: {}, style: {} },
        { entityType: 'Relationship', id: 'r1', fromId: 'a', toId: 'b', type: 'FOLLOWS', properties: {}, style: {} },
      ],
      style: {},
    };
    const { graph } = readGraph(writeGraph(multi));
    expect(graph.relationships).toHaveLength(2);
    expect(graph.relationships.map((r) => r.type).sort()).toEqual(['FOLLOWS', 'KNOWS']);
  });

  it('round-trips a non-BMP unicode caption byte-for-byte', () => {
    const u: Graph = {
      nodes: [{
        entityType: 'Node', id: 'n0', position: new Point(0, 0),
        caption: '👋 héllo 北京 🌏', labels: [], properties: {}, style: {},
      }],
      relationships: [],
      style: {},
    };
    const { graph } = readGraph(writeGraph(u));
    expect(graph.nodes[0].caption).toBe('👋 héllo 北京 🌏');
  });

  it('preserves fractional node positions through one round-trip', () => {
    const frac: Graph = {
      nodes: [{
        entityType: 'Node', id: 'n0', position: new Point(123.456789, -987.654321),
        caption: 'F', labels: [], properties: {}, style: {},
      }],
      relationships: [],
      style: {},
    };
    const { graph } = readGraph(writeGraph(frac));
    expect(graph.nodes[0].position.x).toBe(123.456789);
    expect(graph.nodes[0].position.y).toBe(-987.654321);
  });

  it('round-trip is idempotent: write(read(write(g))) == write(g)', () => {
    const original = sampleGraph();
    const once = writeGraph(original);
    const { graph } = readGraph(once);
    const twice = writeGraph(graph);
    expect(twice).toBe(once);
  });
});
