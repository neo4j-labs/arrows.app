import { describe, expect, it } from 'vitest';
import { listResources, readResource } from './resources';

describe('MCP resources', () => {
  it('listResources returns at least the four canonical entries', () => {
    const uris = listResources().map((r) => r.uri);
    expect(uris).toContain('arrows://spec/style-schema');
    expect(uris).toContain('arrows://conventions/neo4j');
    expect(uris).toContain('arrows://spec/model-types');
    expect(uris).toContain('arrows://spec/themes');
  });

  it('readResource(style-schema) returns JSON with attributes keyed by style name', () => {
    const { contents } = readResource('arrows://spec/style-schema');
    expect(contents).toHaveLength(1);
    const parsed = JSON.parse(contents[0].text);
    expect(parsed.attributes['node-color']).toBeDefined();
  });

  it('readResource(themes) returns the canonical themes array', () => {
    const { contents } = readResource('arrows://spec/themes');
    const parsed = JSON.parse(contents[0].text);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('readResource(model-types) returns markdown', () => {
    const { contents } = readResource('arrows://spec/model-types');
    expect(contents[0].mimeType).toBe('text/markdown');
    expect(contents[0].text).toContain('interface Graph');
  });

  it('readResource(conventions) returns markdown with Neo4j naming guidance', () => {
    const { contents } = readResource('arrows://conventions/neo4j');
    expect(contents[0].text).toContain('PascalCase');
    expect(contents[0].text).toContain('SCREAMING_SNAKE_CASE');
  });

  it('readResource(examples/social) returns the social fixture', () => {
    const { contents } = readResource('arrows://examples/social');
    const parsed = JSON.parse(contents[0].text);
    expect(parsed.nodes.length).toBeGreaterThan(0);
    expect(parsed.relationships.length).toBeGreaterThan(0);
  });

  it('readResource(unknown) throws', () => {
    expect(() => readResource('arrows://unknown')).toThrow();
  });
});
