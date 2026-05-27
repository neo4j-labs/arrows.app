import { describe, expect, it } from 'vitest';
import {
  STATIC_RESOURCES,
  listExampleFixtures,
  readExampleFixture,
} from './resources';
import { applyPatchInputShape, exportArrowsCypher } from './tools';

const findResource = (uri: string) =>
  STATIC_RESOURCES.find((r) => r.uri === uri);

describe('STATIC_RESOURCES (registerResource source of truth)', () => {
  it('advertises every canonical URI', () => {
    const uris = STATIC_RESOURCES.map((r) => r.uri);
    for (const expected of [
      'arrows://spec/style-schema',
      'arrows://spec/themes',
      'arrows://spec/model-types',
      'arrows://conventions/neo4j',
      'arrows://spec/patch-ops',
      'arrows://spec/cypher-mapping',
      'arrows://examples/index',
      'arrows://guide/workflow',
      'arrows://spec/cypher-templates',
    ]) {
      expect(uris).toContain(expected);
    }
  });

  it('style-schema body keys attributes by style name', () => {
    const text = findResource('arrows://spec/style-schema')!.read();
    const parsed = JSON.parse(text);
    expect(parsed.attributes['node-color']).toBeDefined();
  });

  it('themes body is a JSON array', () => {
    const text = findResource('arrows://spec/themes')!.read();
    expect(Array.isArray(JSON.parse(text))).toBe(true);
  });

  it('model-types body describes the Graph interface', () => {
    const r = findResource('arrows://spec/model-types')!;
    expect(r.mimeType).toBe('text/markdown');
    expect(r.read()).toContain('interface Graph');
  });

  it('patch-ops doc names every variant the schema actually accepts', () => {
    const text = findResource('arrows://spec/patch-ops')!.read();
    const opSchema = applyPatchInputShape.ops.element as unknown as {
      options: ReadonlyArray<{ shape: { type: { value: string } } }>;
    };
    const opNames = opSchema.options.map((o) => o.shape.type.value);
    expect(opNames.length).toBeGreaterThanOrEqual(15);
    for (const name of opNames) {
      expect(text, `patch-ops doc missing ${name}`).toContain(name);
    }
  });

  it('cypher-mapping doc emission examples match the real encoder', () => {
    const cases: Array<[string, string]> = [
      ['Alice', '"Alice"'],
      ["'Alice'", "'Alice'"],
      ['42', '42'],
      ['true', 'true'],
      ['false', 'false'],
      ['null', 'null'],
      ['$ownerId', '$ownerId'],
      ["date('2024-01-15')", "date('2024-01-15')"],
    ];
    for (const [input, expected] of cases) {
      const graph = JSON.stringify({
        style: {},
        relationships: [],
        nodes: [
          {
            id: 'n',
            position: { x: 0, y: 0 },
            caption: '',
            labels: ['T'],
            properties: { p: input },
            style: {},
          },
        ],
      });
      const { cypher } = exportArrowsCypher({ graph });
      expect(
        cypher,
        `value ${JSON.stringify(input)} did not encode to ${expected}`
      ).toContain(`p: ${expected}`);
    }
  });

  it('examples/index lists every bundled fixture with a layout hint', () => {
    const text = findResource('arrows://examples/index')!.read();
    const parsed = JSON.parse(text);
    const names = parsed.examples.map((e: { name: string }) => e.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'social',
        'iam-rbac',
        'microservices',
        'lexical-graph',
        'order-lifecycle',
        'citations',
      ])
    );
    for (const e of parsed.examples) {
      expect(e.uri).toMatch(/^arrows:\/\/examples\//);
      expect(['force', 'hierarchical', 'radial', 'circular', 'grid']).toContain(
        e.layout
      );
    }
  });
});

describe('example-fixture template helpers', () => {
  it('listExampleFixtures enumerates every .arrows file under fixtures/examples', () => {
    const names = listExampleFixtures().map((e) => e.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'social',
        'iam-rbac',
        'microservices',
        'lexical-graph',
        'order-lifecycle',
        'citations',
      ])
    );
  });

  it('readExampleFixture(social) returns the social fixture JSON', () => {
    const fixture = readExampleFixture('social');
    expect(fixture).not.toBeNull();
    const parsed = JSON.parse(fixture!.text);
    expect(parsed.nodes.length).toBeGreaterThan(0);
    expect(parsed.relationships.length).toBeGreaterThan(0);
  });

  it('readExampleFixture(missing) returns null instead of throwing', () => {
    expect(readExampleFixture('does-not-exist')).toBeNull();
  });
});
