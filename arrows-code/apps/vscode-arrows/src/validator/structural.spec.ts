import { describe, expect, it } from 'vitest';
import { Point } from '@neo4j-arrows/model';
import type { Graph } from '@neo4j-arrows/model';
import { checkStructural } from './structural';
import { CODES } from './types';

const empty = (): Graph => ({ nodes: [], relationships: [], style: {} });

const node = (id: string, overrides: Partial<Graph['nodes'][number]> = {}): Graph['nodes'][number] => ({
  entityType: 'Node',
  id,
  position: new Point(0, 0),
  caption: id,
  labels: [],
  properties: {},
  style: {},
  ...overrides,
});

const codes = (diagnostics: ReturnType<typeof checkStructural>): string[] => diagnostics.map((d) => d.code);

describe('structural validator', () => {
  it('clean graph produces zero diagnostics', () => {
    const g: Graph = {
      nodes: [node('n0'), node('n1')],
      relationships: [{ entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n1', type: 'R', properties: {}, style: {} }],
      style: {},
    };
    expect(checkStructural(g)).toEqual([]);
  });

  it('flags duplicate node ids', () => {
    const g: Graph = { nodes: [node('dup'), node('dup')], relationships: [], style: {} };
    expect(codes(checkStructural(g))).toContain(CODES.duplicateId);
  });

  it('flags duplicate relationship ids', () => {
    const g: Graph = {
      nodes: [node('n0'), node('n1')],
      relationships: [
        { entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n1', type: 'A', properties: {}, style: {} },
        { entityType: 'Relationship', id: 'r0', fromId: 'n1', toId: 'n0', type: 'B', properties: {}, style: {} },
      ],
      style: {},
    };
    expect(codes(checkStructural(g))).toContain(CODES.duplicateId);
  });

  it('flags ref-integrity violations on fromId and toId', () => {
    const g: Graph = {
      nodes: [node('n0')],
      relationships: [
        { entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'ghost', type: 'R', properties: {}, style: {} },
        { entityType: 'Relationship', id: 'r1', fromId: 'unknown', toId: 'n0', type: 'R', properties: {}, style: {} },
      ],
      style: {},
    };
    const diags = checkStructural(g);
    expect(diags.filter((d) => d.code === CODES.refIntegrity)).toHaveLength(2);
  });

  it('flags missing required fields', () => {
    const g: Graph = empty();
    g.nodes.push({ ...node('n0'), id: '' });
    expect(codes(checkStructural(g))).toContain(CODES.emptyRequired);
  });

  it('flags unknown style keys (graph-level)', () => {
    const g: Graph = { ...empty(), style: { 'totally-made-up': '#fff' } };
    expect(codes(checkStructural(g))).toContain(CODES.styleKeyUnknown);
  });

  it('accepts known style keys (value validation deferred to a future layer)', () => {
    const g: Graph = { ...empty(), style: { 'node-color': '#aabbcc' } };
    expect(checkStructural(g)).toEqual([]);
  });

  it('flags unknown style keys on nodes and relationships, not just graph', () => {
    const g: Graph = {
      nodes: [node('n0', { style: { 'unknown-on-node': '1' } })],
      relationships: [{
        entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n0', type: 'R',
        properties: {}, style: { 'unknown-on-rel': '2' },
      }],
      style: {},
    };
    const unknownStyles = checkStructural(g).filter((d) => d.code === CODES.styleKeyUnknown);
    expect(unknownStyles).toHaveLength(2);
  });

  it('accepts self-loops (fromId === toId) without diagnostics', () => {
    const g: Graph = {
      nodes: [node('n0')],
      relationships: [{
        entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n0', type: 'CONNECTS',
        properties: {}, style: {},
      }],
      style: {},
    };
    expect(checkStructural(g)).toEqual([]);
  });

  it('accepts multi-edges (two relationships between the same node pair)', () => {
    const g: Graph = {
      nodes: [node('n0'), node('n1')],
      relationships: [
        { entityType: 'Relationship', id: 'r0', fromId: 'n0', toId: 'n1', type: 'KNOWS', properties: {}, style: {} },
        { entityType: 'Relationship', id: 'r1', fromId: 'n0', toId: 'n1', type: 'FOLLOWS', properties: {}, style: {} },
      ],
      style: {},
    };
    expect(checkStructural(g)).toEqual([]);
  });

  it('flags BOTH missing-fromId AND missing-toId when both endpoints dangle', () => {
    const g: Graph = {
      nodes: [],
      relationships: [{
        entityType: 'Relationship', id: 'r0', fromId: 'ghostA', toId: 'ghostB', type: 'R',
        properties: {}, style: {},
      }],
      style: {},
    };
    const refDiags = checkStructural(g).filter((d) => d.code === CODES.refIntegrity);
    expect(refDiags).toHaveLength(2);
  });

  it('does not mutate the input graph', () => {
    const g: Graph = { ...empty(), style: { 'totally-made-up': '#fff' } };
    const before = JSON.stringify(g);
    checkStructural(g);
    expect(JSON.stringify(g)).toBe(before);
  });
});
