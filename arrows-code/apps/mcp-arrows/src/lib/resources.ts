import {
  styleAttributes,
  styleAttributeGroups,
  themes,
} from '@neo4j-arrows/model';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resources Claude can fetch via MCP `resources/read` instead of bloating tool
 * descriptions. All generated from arrows' canonical source modules — zero drift.
 */

const RESOURCE_URIS = {
  styleSchema: 'arrows://spec/style-schema',
  conventions: 'arrows://conventions/neo4j',
  modelTypes: 'arrows://spec/model-types',
  themes: 'arrows://spec/themes',
} as const;

export function listResources(): Array<{ uri: string; name: string; description: string; mimeType: string }> {
  return [
    {
      uri: RESOURCE_URIS.styleSchema,
      name: 'arrows style-schema (generated from libs/model/styling.ts)',
      description: 'Every valid style key with its type, default, and accepted values. Source of truth for what AI can set on graph/node/relationship.style.',
      mimeType: 'application/json',
    },
    {
      uri: RESOURCE_URIS.themes,
      name: 'arrows built-in themes',
      description: 'Curated theme presets from libs/model/themes.ts. Apply with setStyle patch ops.',
      mimeType: 'application/json',
    },
    {
      uri: RESOURCE_URIS.modelTypes,
      name: 'arrows model TypeScript interfaces',
      description: 'Shape of Graph, Node, Relationship, Point — what JSON the format-json reader/writer accepts.',
      mimeType: 'text/markdown',
    },
    {
      uri: RESOURCE_URIS.conventions,
      name: 'Neo4j property-graph modelling conventions',
      description: 'Naming conventions and modelling guidance the AI should follow when building graphs.',
      mimeType: 'text/markdown',
    },
  ];
}

export function readResource(uri: string): { contents: Array<{ uri: string; mimeType: string; text: string }> } {
  switch (uri) {
    case RESOURCE_URIS.styleSchema:
      return single(uri, 'application/json', JSON.stringify({
        groups: styleAttributeGroups.map((g) => ({ name: g.name, entityTypes: g.entityTypes, attributes: g.attributes.map((a) => a.key) })),
        attributes: Object.fromEntries(
          Object.entries(styleAttributes).map(([key, attr]) => [
            key,
            { type: attr.type, defaultValue: attr.defaultValue, appliesTo: attr.appliesTo },
          ]),
        ),
      }, null, 2));

    case RESOURCE_URIS.themes:
      return single(uri, 'application/json', JSON.stringify(themes, null, 2));

    case RESOURCE_URIS.modelTypes:
      return single(uri, 'text/markdown', MODEL_TYPES_DOC);

    case RESOURCE_URIS.conventions:
      return single(uri, 'text/markdown', CONVENTIONS_DOC);

    default:
      // arrows://examples/<name> → serve the fixture file
      const exampleMatch = /^arrows:\/\/examples\/(.+)$/.exec(uri);
      if (exampleMatch) {
        const name = exampleMatch[1];
        const fixturesDir = join(__dirname, '..', '..', '..', '..', 'fixtures', 'examples');
        const file = readdirSync(fixturesDir).find((f) => f === `${name}.arrows` || f === name);
        if (file) {
          return single(uri, 'application/json', readFileSync(join(fixturesDir, file), 'utf8'));
        }
      }
      throw new Error(`Unknown resource: ${uri}`);
  }
}

function single(uri: string, mimeType: string, text: string): { contents: Array<{ uri: string; mimeType: string; text: string }> } {
  return { contents: [{ uri, mimeType, text }] };
}

const MODEL_TYPES_DOC = `# arrows model types

A graph is the JSON shape arrows.app saves and what \`format-json\` reads/writes:

\`\`\`ts
interface Graph {
  nodes: Node[]
  relationships: Relationship[]
  style: Record<string, unknown>     // graph-level defaults
}

interface Node {
  id: string                          // unique within graph
  position: { x: number, y: number }  // serialized as plain object; reconstructed to Point on read
  caption: string                     // displayed text
  labels: string[]                    // Neo4j labels (PascalCase by convention)
  properties: Record<string, string>  // values are strings; numbers/quoted strings parsed by arrows model
  style: Record<string, string>       // override graph-level style
}

interface Relationship {
  id: string
  fromId: string                      // must reference an existing node.id
  toId: string                        // must reference an existing node.id
  type: string                        // SCREAMING_SNAKE_CASE by convention
  properties: Record<string, string>
  style: Record<string, string>
}
\`\`\`

\`Point\` is reconstructed as a class instance with .x, .y by the format-json reader.
`;

const CONVENTIONS_DOC = `# Neo4j property-graph modelling conventions

When building \`.arrows\` graphs, follow these conventions so the result deploys cleanly to a real Neo4j database.

## Naming

- **Labels**: PascalCase. \`Person\`, \`Order\`, \`KnowledgeArticle\` — not \`person\`, \`PERSON\`, \`USER_PROFILE\`.
- **Relationship types**: SCREAMING_SNAKE_CASE. \`KNOWS\`, \`PLACED_ORDER\`, \`AUTHORED_BY\`.
- **Property keys**: camelCase. \`firstName\`, \`createdAt\` — not \`first_name\` or \`FirstName\`.

## Direction

- Relationships have direction; pick the one that reads naturally as a sentence: \`(Customer)-[:PLACED]->(Order)\` not \`(Order)-[:BELONGS_TO]->(Customer)\`.
- For symmetric relationships (\`KNOWS\`), keep one direction and query both at read time. Don't model both directions as separate edges.

## Modelling patterns

- **Don't store booleans as labels.** \`:ActiveUser\` is a smell; use \`active: true\` as a property.
- **Hyperedges via intermediate node.** Relationships can't have relationships; if a "relationship" has metadata that itself participates in relationships, model it as a node.
- **Avoid deep label hierarchies.** Labels are flat tags, not a class hierarchy. Use multiple labels (\`:Person:Customer\`) sparingly.
- **Property values are strings in the file format.** Numbers + booleans are stringified; quoted strings (\`"'Alice'"\`) indicate the literal string \`'Alice'\` in Cypher.

## When to prefer arrows-code MCP tools

- **Always \`describe_schema\` before adding entities** — confirms the label/type doesn't already exist.
- **Use \`apply_patch\`, never rewrite the whole file** — token-cheap and preserves positions/styles of nodes you didn't touch.
- **Run \`validate_arrows\` after every change** — surfaces dangling rels, duplicate ids, unknown style keys.
- **Use \`export_cypher\` to deploy** — same emission path arrows.app uses, guaranteed parity.
`;
