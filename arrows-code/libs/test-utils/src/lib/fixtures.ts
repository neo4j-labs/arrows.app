import { Point } from '@neo4j-arrows/model';
import type { Graph, Node, Relationship } from '@neo4j-arrows/model';

export const emptyGraph = (): Graph => ({ nodes: [], relationships: [], style: {} });

export interface NodeOverrides extends Partial<Omit<Node, 'position'>> {
  position?: Point | { x: number; y: number };
}

export function makeNode(id: string, overrides: NodeOverrides = {}): Node {
  const { position, ...rest } = overrides;
  const pos = position
    ? position instanceof Point ? position : new Point(position.x, position.y)
    : new Point(0, 0);
  return {
    entityType: 'Node',
    id,
    position: pos,
    caption: id,
    labels: [],
    properties: {},
    style: {},
    ...rest,
  };
}

export function makeRel(id: string, fromId: string, toId: string, type: string, overrides: Partial<Relationship> = {}): Relationship {
  return {
    entityType: 'Relationship',
    id,
    fromId,
    toId,
    type,
    properties: {},
    style: {},
    ...overrides,
  };
}

/** Two-Person-KNOWS — used across multiple spec files. */
export function aliceBobGraph(): Graph {
  return {
    nodes: [
      makeNode('n0', { position: new Point(120, 240), caption: 'Alice', labels: ['Person'], properties: { name: "'Alice'" } }),
      makeNode('n1', { position: new Point(320, 240), caption: 'Bob', labels: ['Person'], properties: { name: "'Bob'" } }),
    ],
    relationships: [makeRel('r0', 'n0', 'n1', 'KNOWS')],
    style: { 'node-color': '#ffe081' },
  };
}
