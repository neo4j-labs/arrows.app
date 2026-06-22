import { describe, expect, it } from 'vitest';
import { Point } from '@neo4j-arrows/model';
import { readGraph } from './read';

describe('readGraph - structural shape', () => {
  it('reads an empty graph stub into a Graph with no nodes or relationships', () => {
    const json = JSON.stringify({ nodes: [], relationships: [], style: {} });
    const { graph, diagnostics } = readGraph(json);

    expect(graph.nodes).toEqual([]);
    expect(graph.relationships).toEqual([]);
    expect(graph.style).toEqual({});
    expect(diagnostics).toEqual([]);
  });

  it('reconstructs Point instances from plain {x,y} position objects', () => {
    const json = JSON.stringify({
      nodes: [{ id: 'n0', position: { x: 12, y: 34 }, caption: 'A', labels: [], properties: {}, style: {} }],
      relationships: [],
      style: {},
    });

    const { graph } = readGraph(json);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].position).toBeInstanceOf(Point);
    expect(graph.nodes[0].position.x).toBe(12);
    expect(graph.nodes[0].position.y).toBe(34);
  });

  it('preserves node id, caption, labels, properties, and style as-is', () => {
    const json = JSON.stringify({
      nodes: [
        {
          id: 'n0',
          position: { x: 0, y: 0 },
          caption: 'Alice',
          labels: ['Person'],
          properties: { name: "'Alice'" },
          style: { 'node-color': '#fce' },
        },
      ],
      relationships: [],
      style: {},
    });

    const { graph } = readGraph(json);
    const node = graph.nodes[0];

    expect(node.id).toBe('n0');
    expect(node.caption).toBe('Alice');
    expect(node.labels).toEqual(['Person']);
    expect(node.properties).toEqual({ name: "'Alice'" });
    expect(node.style).toEqual({ 'node-color': '#fce' });
  });

  it('defaults missing optional node fields (labels, properties, style) to empty containers', () => {
    const json = JSON.stringify({
      nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'X' }],
      relationships: [],
      style: {},
    });

    const { graph } = readGraph(json);

    expect(graph.nodes[0].labels).toEqual([]);
    expect(graph.nodes[0].properties).toEqual({});
    expect(graph.nodes[0].style).toEqual({});
  });

  it('keeps relationships whose endpoints exist in the node set', () => {
    const json = JSON.stringify({
      nodes: [
        { id: 'n0', position: { x: 0, y: 0 }, caption: 'A', labels: [], properties: {}, style: {} },
        { id: 'n1', position: { x: 10, y: 0 }, caption: 'B', labels: [], properties: {}, style: {} },
      ],
      relationships: [
        { id: 'r0', fromId: 'n0', toId: 'n1', type: 'KNOWS', properties: {}, style: {} },
      ],
      style: {},
    });

    const { graph, diagnostics } = readGraph(json);

    expect(graph.relationships).toHaveLength(1);
    expect(graph.relationships[0].fromId).toBe('n0');
    expect(graph.relationships[0].toId).toBe('n1');
    expect(diagnostics).toEqual([]);
  });

  it('drops orphan relationships and emits a diagnostic per dropped rel', () => {
    const json = JSON.stringify({
      nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'A', labels: [], properties: {}, style: {} }],
      relationships: [
        { id: 'r0', fromId: 'n0', toId: 'missing', type: 'KNOWS', properties: {}, style: {} },
      ],
      style: {},
    });

    const { graph, diagnostics } = readGraph(json);

    expect(graph.relationships).toEqual([]);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('format-json.orphan-relationship');
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('unwraps a {graph: {...}, gangs: [...]} envelope to find the graph', () => {
    const json = JSON.stringify({
      graph: {
        nodes: [{ id: 'n0', position: { x: 1, y: 2 }, caption: 'A', labels: [], properties: {}, style: {} }],
        relationships: [],
        style: {},
      },
      gangs: [],
    });

    const { graph } = readGraph(json);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('n0');
  });
});

describe('readGraph - non-array nodes', () => {
  it('emits an invalid-shape diagnostic when nodes is a string instead of an array', () => {
    const { graph, diagnostics } = readGraph(
      JSON.stringify({ nodes: 'bad', relationships: [], style: {} }),
    );
    expect(graph.nodes).toEqual([]);
    expect(diagnostics.some((d) => d.code === 'format-json.invalid-shape')).toBe(true);
  });
});

describe('readGraph - malformed input', () => {
  it('returns an empty graph with an error diagnostic on invalid JSON', () => {
    const { graph, diagnostics } = readGraph('not json {');

    expect(graph.nodes).toEqual([]);
    expect(graph.relationships).toEqual([]);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('format-json.parse-error');
    expect(diagnostics[0].severity).toBe('error');
  });

  it('returns an empty graph with an error diagnostic when top-level shape is wrong', () => {
    const { graph, diagnostics } = readGraph(JSON.stringify(['not', 'an', 'object']));

    expect(graph.nodes).toEqual([]);
    expect(diagnostics.some((d) => d.code === 'format-json.invalid-shape')).toBe(true);
  });

  it('never throws - even on null', () => {
    expect(() => readGraph('null')).not.toThrow();
  });

  it('parses CRLF-encoded JSON (Windows-saved .arrows files)', () => {
    const payload = { nodes: [], relationships: [], style: {} };
    const lf = JSON.stringify(payload, null, 2);
    const crlf = lf.replace(/\n/g, '\r\n');
    const { graph, diagnostics } = readGraph(crlf);
    expect(diagnostics).toEqual([]);
    expect(graph.nodes).toEqual([]);
  });

  it('tolerates a trailing newline at end-of-file', () => {
    const payload = JSON.stringify({ nodes: [], relationships: [], style: {} }) + '\n';
    const { diagnostics } = readGraph(payload);
    expect(diagnostics).toEqual([]);
  });

  it('preserves caption with non-BMP unicode (emoji) byte-for-byte', () => {
    const json = JSON.stringify({
      nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: '👋 héllo 北京', labels: [], properties: {}, style: {} }],
      relationships: [],
      style: {},
    });
    const { graph } = readGraph(json);
    expect(graph.nodes[0].caption).toBe('👋 héllo 北京');
  });
});
