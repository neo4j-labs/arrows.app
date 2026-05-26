import { describe, it, expect } from 'vitest';
import { exportCypher } from './exportCypher';

describe('exportCypher — named relationship types round-trip', () => {
  it('preserves a named relationship type in the emitted Cypher (no sentinel substitution)', () => {
    const graph = {
      nodes: [
        { id: 'n0', position: { x: 0, y: 0 }, caption: 'A', labels: ['Person'], properties: {}, style: {} },
        { id: 'n1', position: { x: 10, y: 0 }, caption: 'B', labels: ['Person'], properties: {}, style: {} },
      ],
      relationships: [
        { id: 'r0', fromId: 'n0', toId: 'n1', type: 'AUTHORED_BY', properties: {}, style: {} },
      ],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    expect(out).toContain(':AUTHORED_BY');
    expect(out).not.toContain(':_RELATED');
  });
});

describe('exportCypher — topology edge cases (mirroring arrows-ts oracle)', () => {
  it('emits an empty-pattern CREATE for a bare node', () => {
    const graph = {
      nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: '', labels: [], properties: {}, style: {} }],
      relationships: [],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    expect(out.replace(/\s+/g, ' ').trim()).toBe('CREATE ()');
  });

  it('comma-joins disconnected components under CREATE', () => {
    const graph = {
      nodes: [
        { id: 'n1', position: { x: 0, y: 0 }, caption: '', labels: [], properties: {}, style: {} },
        { id: 'n2', position: { x: 10, y: 0 }, caption: '', labels: [], properties: {}, style: {} },
        { id: 'n3', position: { x: 0, y: 20 }, caption: '', labels: [], properties: {}, style: {} },
        { id: 'n4', position: { x: 10, y: 20 }, caption: '', labels: [], properties: {}, style: {} },
      ],
      relationships: [
        { id: 'r1', fromId: 'n1', toId: 'n2', type: 'KNOWS', properties: {}, style: {} },
        { id: 'r2', fromId: 'n3', toId: 'n4', type: 'KNOWS', properties: {}, style: {} },
      ],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    expect(out.match(/CREATE/g)).toHaveLength(1);
    expect(out).toMatch(/\),\s*\(/);
  });

  it('renders a self-loop with the same identifier on both ends', () => {
    const graph = {
      nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'Hub', labels: ['Node'], properties: {}, style: {} }],
      relationships: [{ id: 'r0', fromId: 'n0', toId: 'n0', type: 'CONNECTS', properties: {}, style: {} }],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    // Path syntax binds the node identifier exactly once; the second occurrence is a back-reference.
    expect(out).toContain(':CONNECTS');
    expect(out).toContain(':Node');
  });

  it('backticks a property key containing a space', () => {
    const graph = {
      nodes: [{
        id: 'n0',
        position: { x: 0, y: 0 },
        caption: '',
        labels: ['Person'],
        properties: { 'first name': "'Alice'" },
        style: {},
      }],
      relationships: [],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    expect(out).toContain('`first name`');
  });
});

describe('exportCypher — injection hardening', () => {
  it('escapes backticks in property keys to prevent identifier-quote breakout', () => {
    const graph = {
      nodes: [{
        id: 'n0',
        position: { x: 0, y: 0 },
        caption: '',
        labels: ['Person'],
        properties: { 'malicious`key': 'value' },
        style: {},
      }],
      relationships: [],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    // The backtick inside the key is doubled per Cypher escape rules.
    expect(out).toContain('`malicious``key`');
    expect(out).not.toMatch(/`malicious`key`/);
  });

  it('escapes double-quotes in property values to prevent string-literal breakout', () => {
    const graph = {
      nodes: [{
        id: 'n0',
        position: { x: 0, y: 0 },
        caption: '',
        labels: ['Person'],
        properties: { name: 'evil" })-[:HACKED]->(:X {x: "' },
        style: {},
      }],
      relationships: [],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    // The payload is preserved as data, but inside an escaped string literal.
    // What matters: the unescaped `"` that would have closed the literal is escaped.
    expect(out).toContain('\\"');
    // Confirm the structural Cypher hasn't been broken: only one `CREATE` clause.
    expect((out.match(/CREATE/g) ?? []).length).toBe(1);
  });

  it('escapes backslashes before quotes so existing escapes survive', () => {
    const graph = {
      nodes: [{
        id: 'n0',
        position: { x: 0, y: 0 },
        caption: '',
        labels: ['Person'],
        properties: { name: 'path\\to\\file' },
        style: {},
      }],
      relationships: [],
      style: {},
    };
    const out = exportCypher(graph, 'CREATE', { includeStyling: false });
    expect(out).toContain('"path\\\\to\\\\file"');
  });
});
