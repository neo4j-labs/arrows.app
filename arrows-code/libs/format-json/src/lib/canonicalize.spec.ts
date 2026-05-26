import { describe, expect, it } from 'vitest';
import { Point } from '@neo4j-arrows/model';
import type { Graph } from '@neo4j-arrows/model';
import { canonicalize } from './canonicalize';

const node = (id: string, x = 0, y = 0): Graph['nodes'][number] => ({
  entityType: 'Node',
  id,
  position: new Point(x, y),
  caption: id,
  labels: [],
  properties: {},
  style: {},
});

describe('canonicalize', () => {
  it('is idempotent', () => {
    const g: Graph = { nodes: [node('n2'), node('n0'), node('n1')], relationships: [], style: {} };
    const once = canonicalize(g);
    const twice = canonicalize(once);
    expect(twice).toEqual(once);
  });

  it('sorts nodes by id', () => {
    const g: Graph = { nodes: [node('n2'), node('n0'), node('n1')], relationships: [], style: {} };
    const c = canonicalize(g);
    expect(c.nodes.map((n) => n.id)).toEqual(['n0', 'n1', 'n2']);
  });

  it('sorts relationships by id', () => {
    const g: Graph = {
      nodes: [node('n0'), node('n1')],
      relationships: [
        { entityType: 'Relationship', id: 'r2', fromId: 'n0', toId: 'n1', type: 'A', properties: {}, style: {} },
        { entityType: 'Relationship', id: 'r1', fromId: 'n0', toId: 'n1', type: 'B', properties: {}, style: {} },
      ],
      style: {},
    };
    const c = canonicalize(g);
    expect(c.relationships.map((r) => r.id)).toEqual(['r1', 'r2']);
  });

  it('does not mutate the input', () => {
    const original: Graph = { nodes: [node('n2'), node('n0')], relationships: [], style: {} };
    const before = [...original.nodes];
    canonicalize(original);
    expect(original.nodes).toEqual(before);
  });

  it('canonicalize(empty) is stable and returns an empty-shape graph', () => {
    const e: Graph = { nodes: [], relationships: [], style: {} };
    const c = canonicalize(e);
    expect(c.nodes).toEqual([]);
    expect(c.relationships).toEqual([]);
    expect(canonicalize(c)).toEqual(c);
  });

  it('preserves a self-loop relationship after canonicalization', () => {
    const g: Graph = {
      nodes: [node('n0')],
      relationships: [{ entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n0', type: 'LOOP', properties: {}, style: {} }],
      style: {},
    };
    const c = canonicalize(g);
    expect(c.relationships).toHaveLength(1);
    expect(c.relationships[0].fromId).toBe('n0');
    expect(c.relationships[0].toId).toBe('n0');
  });

  it('two equal graphs with different array orders canonicalize to deep-equal results', () => {
    const a: Graph = { nodes: [node('n0', 1, 1), node('n1', 2, 2)], relationships: [], style: {} };
    const b: Graph = { nodes: [node('n1', 2, 2), node('n0', 1, 1)], relationships: [], style: {} };
    expect(canonicalize(a)).toEqual(canonicalize(b));
  });
});
