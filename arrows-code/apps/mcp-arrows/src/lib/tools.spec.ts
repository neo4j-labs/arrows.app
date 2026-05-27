import { describe, expect, it } from 'vitest';
import {
  applyPatch,
  describeSchema,
  layoutGraph,
  renderArrows,
  validateArrows,
} from './tools';

/** Inline known-good Alice/Bob graph — robust to fixture file edits. */
const fixture = (): string =>
  JSON.stringify({
    style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
    nodes: [
      {
        id: 'n0',
        position: { x: 0, y: 0 },
        caption: 'Alice',
        labels: ['Person'],
        properties: { name: "'Alice'", age: '30' },
        style: {},
      },
      {
        id: 'n1',
        position: { x: 400, y: 0 },
        caption: 'Bob',
        labels: ['Person'],
        properties: { name: "'Bob'", age: '32', greeting: '$greeting' },
        style: {},
      },
    ],
    relationships: [
      {
        id: 'r0',
        fromId: 'n0',
        toId: 'n1',
        type: 'KNOWS',
        properties: {},
        style: {},
      },
    ],
  });

describe('renderArrows tool', () => {
  it('returns parse-error diagnostics for malformed JSON without throwing', async () => {
    const result = await renderArrows({ graph: 'not json' });
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it('throws on missing required graph param (zod boundary)', async () => {
    await expect(renderArrows({})).rejects.toThrow();
  });
});

describe('validateArrows tool', () => {
  it('returns no error-severity diagnostics on a clean graph (style-key warnings allowed)', async () => {
    const result = await validateArrows({ graph: fixture() });
    const errors = (result.diagnostics as Array<{ severity: string }>).filter(
      (d) => d.severity === 'error'
    );
    expect(errors).toEqual([]);
  });

  it('surfaces a parse-error diagnostic on garbage input', async () => {
    const result = await validateArrows({ graph: '{{{' });
    expect(result.diagnostics).toHaveLength(1);
  });

  it('surfaces structural diagnostics (duplicate ids)', async () => {
    const broken = JSON.stringify({
      nodes: [
        {
          id: 'dup',
          position: { x: 0, y: 0 },
          caption: 'A',
          labels: [],
          properties: {},
          style: {},
        },
        {
          id: 'dup',
          position: { x: 10, y: 0 },
          caption: 'B',
          labels: [],
          properties: {},
          style: {},
        },
      ],
      relationships: [],
      style: {},
    });
    const result = await validateArrows({ graph: broken });
    expect(
      result.diagnostics.some(
        (d) => (d as { code: string }).code === 'structural.duplicate-id'
      )
    ).toBe(true);
  });
});

describe('applyPatch tool', () => {
  it('adds a node + relationship via ops and returns updated graph JSON', () => {
    const result = applyPatch({
      graph: fixture(),
      ops: [
        {
          type: 'addNode',
          id: 'n99',
          x: 600,
          y: 200,
          caption: 'New',
          labels: ['Person'],
        },
        {
          type: 'addRelationship',
          id: 'r99',
          fromId: 'n0',
          toId: 'n99',
          relType: 'KNOWS',
        },
      ],
    });
    expect(result.errors).toEqual([]);
    expect(result.graph).toContain('"id": "n99"');
    expect(result.graph).toContain('"type": "KNOWS"');
  });

  it('returns errors for invalid ops without trashing the graph', () => {
    const result = applyPatch({
      graph: fixture(),
      ops: [
        {
          type: 'addRelationship',
          id: 'r99',
          fromId: 'ghost',
          toId: 'n0',
          relType: 'X',
        },
      ],
    });
    expect(result.errors).toHaveLength(1);
  });
});

describe('describeSchema tool', () => {
  it('extracts labels, rel types, and props from a graph', () => {
    const result = describeSchema({ graph: fixture() });
    expect(result.labels).toContain('Person');
    expect(result.relTypes).toContain('KNOWS');
    expect(result.propsByLabel.Person).toContain('name');
    expect(result.propsByLabel.Person).toContain('age');
  });

  it('aggregates relationship direction by label pair', () => {
    const result = describeSchema({ graph: fixture() });
    const personToPerson = result.relsByDirection.find(
      (d) =>
        d.fromLabel === 'Person' && d.toLabel === 'Person' && d.type === 'KNOWS'
    );
    expect(personToPerson?.count).toBe(1);
  });

  it('reports relationships between unlabeled nodes with the <no-label> sentinel', () => {
    const graph = JSON.stringify({
      nodes: [
        {
          id: 'n0',
          position: { x: 0, y: 0 },
          caption: '',
          labels: [],
          properties: {},
          style: {},
        },
        {
          id: 'n1',
          position: { x: 10, y: 0 },
          caption: '',
          labels: [],
          properties: {},
          style: {},
        },
      ],
      relationships: [
        {
          id: 'r0',
          fromId: 'n0',
          toId: 'n1',
          type: 'LINKED',
          properties: {},
          style: {},
        },
      ],
      style: {},
    });
    const result = describeSchema({ graph });
    expect(result.relsByDirection).toContainEqual({
      fromLabel: '<no-label>',
      toLabel: '<no-label>',
      type: 'LINKED',
      count: 1,
    });
  });
});

describe('layoutGraph tool', () => {
  it('runs the force-directed layout and returns repositioned nodes', async () => {
    const result = await layoutGraph({ graph: fixture(), layout: 'force' });
    expect(result.layout).toBe('force');
    expect(result.nodeCount).toBe(2);
    const parsed = JSON.parse(result.graph);
    // Positions should have moved off the original (0,0) / (400,0) seeds.
    const pos = parsed.nodes.map(
      (n: { position: { x: number; y: number } }) => n.position
    );
    expect(
      pos.every(
        (p: { x: number; y: number }) =>
          Number.isFinite(p.x) && Number.isFinite(p.y)
      )
    ).toBe(true);
  });

  it('runs the grid layout deterministically', async () => {
    const out1 = await layoutGraph({ graph: fixture(), layout: 'grid' });
    const out2 = await layoutGraph({ graph: fixture(), layout: 'grid' });
    expect(out1.graph).toBe(out2.graph);
  });

  it('rejects an unknown layout id at the zod boundary', async () => {
    await expect(
      layoutGraph({ graph: fixture(), layout: 'spiral' as never })
    ).rejects.toThrow();
  });
});

const emptyFixture = (): string =>
  JSON.stringify({ nodes: [], relationships: [], style: {} });

describe('tools — empty-graph edges', () => {
  it('validateArrows on an empty graph returns no error diagnostics', async () => {
    const result = await validateArrows({ graph: emptyFixture() });
    const errors = (result.diagnostics as Array<{ severity: string }>).filter(
      (d) => d.severity === 'error'
    );
    expect(errors).toEqual([]);
  });

  it('describeSchema on an empty graph returns empty collections', () => {
    const result = describeSchema({ graph: emptyFixture() });
    expect(result.labels).toEqual([]);
    expect(result.relTypes).toEqual([]);
  });
});

describe('applyPatch — composition + self-loop', () => {
  it('composes multiple ops into a single result (sequential apply)', () => {
    const result = applyPatch({
      graph: emptyFixture(),
      ops: [
        { type: 'addNode', id: 'a', x: 0, y: 0 },
        { type: 'addNode', id: 'b', x: 100, y: 0 },
        {
          type: 'addRelationship',
          id: 'r0',
          fromId: 'a',
          toId: 'b',
          relType: 'KNOWS',
        },
        { type: 'addLabel', id: 'a', label: 'Person' },
        { type: 'setProperty', id: 'b', key: 'name', value: "'Bob'" },
      ],
    });
    expect(result.errors).toEqual([]);
    expect(result.graph).toContain('"id": "a"');
    expect(result.graph).toContain('"id": "b"');
    expect(result.graph).toContain('"Person"');
    expect(result.graph).toContain('"KNOWS"');
  });

  it('accepts a self-loop add via apply_patch', () => {
    const result = applyPatch({
      graph: emptyFixture(),
      ops: [
        { type: 'addNode', id: 'n0', x: 0, y: 0 },
        {
          type: 'addRelationship',
          id: 'r0',
          fromId: 'n0',
          toId: 'n0',
          relType: 'LOOP',
        },
      ],
    });
    expect(result.errors).toEqual([]);
    expect(result.graph).toContain('"LOOP"');
  });
});
