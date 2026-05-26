import { describe, expect, it } from 'vitest';
import { Point } from '@neo4j-arrows/model';
import type { Graph } from '@neo4j-arrows/model';
import { apply } from './apply';

const empty = (): Graph => ({ nodes: [], relationships: [], style: {} });

describe('apply — node ops', () => {
  it('addNode adds a node with the given id and position', () => {
    const { graph, errors } = apply(empty(), {
      type: 'addNode', id: 'n0', x: 10, y: 20, caption: 'A', labels: ['L'],
    });
    expect(errors).toEqual([]);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('n0');
    expect(graph.nodes[0].position).toBeInstanceOf(Point);
    expect(graph.nodes[0].position.x).toBe(10);
    expect(graph.nodes[0].caption).toBe('A');
    expect(graph.nodes[0].labels).toEqual(['L']);
  });

  it('addNode errors on duplicate id', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0 }).graph;
    const { errors } = apply(start, { type: 'addNode', id: 'n0', x: 1, y: 1 });
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('patch.apply-error');
  });

  it('movePos translates a node by dx,dy', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 10, y: 20 }).graph;
    const { graph } = apply(start, { type: 'movePos', id: 'n0', dx: 5, dy: -5 });
    expect(graph.nodes[0].position.x).toBe(15);
    expect(graph.nodes[0].position.y).toBe(15);
  });

  it('removeNode removes node + all attached relationships', () => {
    const g1 = apply(empty(), [
      { type: 'addNode', id: 'n0', x: 0, y: 0 },
      { type: 'addNode', id: 'n1', x: 10, y: 0 },
      { type: 'addRelationship', id: 'r0', fromId: 'n0', toId: 'n1', relType: 'R' },
    ]);
    expect(g1.errors).toEqual([]);
    const { graph } = apply(g1.graph, { type: 'removeNode', id: 'n0' });
    expect(graph.nodes.map((n) => n.id)).toEqual(['n1']);
    expect(graph.relationships).toEqual([]);
  });
});

describe('apply — relationships', () => {
  it('addRelationship requires both endpoints', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0 }).graph;
    const { errors } = apply(start, { type: 'addRelationship', id: 'r0', fromId: 'n0', toId: 'ghost', relType: 'R' });
    expect(errors).toHaveLength(1);
  });

  it('renameRelType updates every matching relationship', () => {
    const g = apply(empty(), [
      { type: 'addNode', id: 'a', x: 0, y: 0 },
      { type: 'addNode', id: 'b', x: 10, y: 0 },
      { type: 'addRelationship', id: 'r0', fromId: 'a', toId: 'b', relType: 'OLD' },
      { type: 'addRelationship', id: 'r1', fromId: 'b', toId: 'a', relType: 'OLD' },
      { type: 'renameRelType', oldType: 'OLD', newType: 'NEW' },
    ]);
    expect(g.errors).toEqual([]);
    expect(g.graph.relationships.every((r) => r.type === 'NEW')).toBe(true);
  });
});

describe('apply — immutability', () => {
  it('does not mutate the input graph', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0 }).graph;
    const before = JSON.stringify(start);
    apply(start, { type: 'setCaption', id: 'n0', caption: 'changed' });
    expect(JSON.stringify(start)).toBe(before);
  });

  it('composition: apply(g, [a,b,c]) ≡ apply(apply(apply(g,a),b),c)', () => {
    const ops = [
      { type: 'addNode', id: 'n0', x: 0, y: 0 } as const,
      { type: 'addNode', id: 'n1', x: 10, y: 10 } as const,
      { type: 'setCaption', id: 'n0', caption: 'A' } as const,
    ];
    const batch = apply(empty(), ops).graph;
    let one = empty();
    for (const op of ops) one = apply(one, op).graph;
    expect(JSON.stringify(batch)).toBe(JSON.stringify(one));
  });
});

describe('apply — coverage of remaining op types', () => {
  it('setPos sets absolute position (replaces, does not translate)', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 5, y: 5 }).graph;
    const { graph } = apply(start, { type: 'setPos', id: 'n0', x: 100, y: 200 });
    expect(graph.nodes[0].position.x).toBe(100);
    expect(graph.nodes[0].position.y).toBe(200);
  });

  it('addLabel appends; addLabel of an existing label is a no-op', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0, labels: ['Person'] }).graph;
    const { graph } = apply(start, [
      { type: 'addLabel', id: 'n0', label: 'Customer' },
      { type: 'addLabel', id: 'n0', label: 'Customer' },
    ]);
    expect(graph.nodes[0].labels).toEqual(['Person', 'Customer']);
  });

  it('addRelationship allows self-loops (fromId === toId)', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0 }).graph;
    const { graph, errors } = apply(start, {
      type: 'addRelationship', id: 'r0', fromId: 'n0', toId: 'n0', relType: 'CONNECTS',
    });
    expect(errors).toEqual([]);
    expect(graph.relationships).toHaveLength(1);
    expect(graph.relationships[0].fromId).toBe('n0');
    expect(graph.relationships[0].toId).toBe('n0');
  });

  it('removeLabel drops the label; removing a missing label is a no-op', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0, labels: ['Person', 'Customer'] }).graph;
    const { graph } = apply(start, [
      { type: 'removeLabel', id: 'n0', label: 'Customer' },
      { type: 'removeLabel', id: 'n0', label: 'Ghost' },
    ]);
    expect(graph.nodes[0].labels).toEqual(['Person']);
  });

  it('setProperty sets a new property and updates an existing one', () => {
    const start = apply(empty(), {
      type: 'addNode', id: 'n0', x: 0, y: 0, properties: { age: '30' },
    }).graph;
    const { graph } = apply(start, [
      { type: 'setProperty', id: 'n0', key: 'name', value: "'Alice'" },
      { type: 'setProperty', id: 'n0', key: 'age', value: '31' },
    ]);
    expect(graph.nodes[0].properties).toEqual({ age: '31', name: "'Alice'" });
  });

  it('removeProperty deletes a key, leaves others intact', () => {
    const start = apply(empty(), {
      type: 'addNode', id: 'n0', x: 0, y: 0,
      properties: { name: "'Alice'", age: '30' },
    }).graph;
    const { graph } = apply(start, { type: 'removeProperty', id: 'n0', key: 'age' });
    expect(graph.nodes[0].properties).toEqual({ name: "'Alice'" });
  });

  it('setRelType changes a single relationship type', () => {
    const g = apply(empty(), [
      { type: 'addNode', id: 'a', x: 0, y: 0 },
      { type: 'addNode', id: 'b', x: 10, y: 0 },
      { type: 'addRelationship', id: 'r0', fromId: 'a', toId: 'b', relType: 'KNOWS' },
      { type: 'setRelType', id: 'r0', relType: 'FOLLOWS' },
    ]);
    expect(g.errors).toEqual([]);
    expect(g.graph.relationships[0].type).toBe('FOLLOWS');
  });

  it('removeRelationship drops the given rel, leaves others', () => {
    const g = apply(empty(), [
      { type: 'addNode', id: 'a', x: 0, y: 0 },
      { type: 'addNode', id: 'b', x: 10, y: 0 },
      { type: 'addRelationship', id: 'r0', fromId: 'a', toId: 'b', relType: 'X' },
      { type: 'addRelationship', id: 'r1', fromId: 'b', toId: 'a', relType: 'Y' },
      { type: 'removeRelationship', id: 'r0' },
    ]);
    expect(g.graph.relationships.map((r) => r.id)).toEqual(['r1']);
  });

  it('renameLabel updates every node carrying the old label', () => {
    const g = apply(empty(), [
      { type: 'addNode', id: 'a', x: 0, y: 0, labels: ['Person'] },
      { type: 'addNode', id: 'b', x: 10, y: 0, labels: ['Person', 'Admin'] },
      { type: 'renameLabel', oldLabel: 'Person', newLabel: 'User' },
    ]);
    expect(g.graph.nodes[0].labels).toEqual(['User']);
    expect(g.graph.nodes[1].labels).toEqual(['User', 'Admin']);
  });

  it('returns a per-op error for missing entity, continues applying subsequent ops', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0 }).graph;
    const result = apply(start, [
      { type: 'setCaption', id: 'ghost', caption: 'X' },
      { type: 'setCaption', id: 'n0', caption: 'Y' },
    ]);
    expect(result.errors).toHaveLength(1);
    expect(result.graph.nodes[0].caption).toBe('Y');
  });
});

describe('apply — style ops', () => {
  it('setStyle with id=null updates graph-level style', () => {
    const { graph } = apply(empty(), { type: 'setStyle', id: null, key: 'node-color', value: '#abc' });
    expect(graph.style['node-color']).toBe('#abc');
  });

  it('setStyle with id updates entity-level style', () => {
    const start = apply(empty(), { type: 'addNode', id: 'n0', x: 0, y: 0 }).graph;
    const { graph } = apply(start, { type: 'setStyle', id: 'n0', key: 'node-color', value: '#fff' });
    expect(graph.nodes[0].style['node-color']).toBe('#fff');
  });
});
