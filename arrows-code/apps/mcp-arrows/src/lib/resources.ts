import {
  styleAttributes,
  styleAttributeGroups,
  themes,
} from '@neo4j-arrows/model';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

/**
 * Resources Claude can fetch via MCP `resources/read` instead of bloating tool
 * descriptions. All generated from arrows' canonical source modules — zero drift.
 */

export interface StaticResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  /** Build the body on demand — keeps doc strings out of memory until read. */
  read: () => string;
}

// Resolve fixtures dir robustly across src (test) and dist (bundled) contexts:
//   src/lib/  → up 4 to apps/mcp-arrows → ../../fixtures/examples (relative to mcp-arrows/)
//   dist/    → up 2 same way
// Walk up from __dirname until we find a fixtures/examples sibling.
function locateFixturesDir(): string {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, 'fixtures', 'examples');
    if (existsSync(candidate)) return candidate;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  // Fall back to the original path so existing behaviour holds in tests.
  return join(__dirname, '..', '..', '..', '..', 'fixtures', 'examples');
}

export const EXAMPLES_FIXTURE_DIR = locateFixturesDir();

export function readExampleFixture(
  name: string
): { mimeType: string; text: string } | null {
  // Prevent path traversal: strip any directory components and allow only
  // alphanumeric, hyphen, and underscore characters in the fixture name.
  const safe = basename(String(name)).replace(/[^A-Za-z0-9_-]/g, '');
  if (!safe) return null;
  const file = readdirSync(EXAMPLES_FIXTURE_DIR).find(
    (f) => f === `${safe}.arrows` || f === safe
  );
  if (!file) return null;
  const fullPath = resolve(EXAMPLES_FIXTURE_DIR, file);
  const safeBase = resolve(EXAMPLES_FIXTURE_DIR);
  if (!fullPath.startsWith(safeBase + '/') && fullPath !== safeBase)
    return null;
  return {
    mimeType: 'application/json',
    text: readFileSync(fullPath, 'utf8'),
  };
}

export function listExampleFixtures(): Array<{ uri: string; name: string }> {
  return readdirSync(EXAMPLES_FIXTURE_DIR)
    .filter((f) => f.endsWith('.arrows'))
    .sort()
    .map((f) => {
      const name = f.replace(/\.arrows$/, '');
      return { uri: `arrows://examples/${name}`, name };
    });
}

const RESOURCE_URIS = {
  styleSchema: 'arrows://spec/style-schema',
  conventions: 'arrows://conventions/neo4j',
  modelTypes: 'arrows://spec/model-types',
  themes: 'arrows://spec/themes',
  patchOps: 'arrows://spec/patch-ops',
  cypherMapping: 'arrows://spec/cypher-mapping',
  examplesIndex: 'arrows://examples/index',
  workflow: 'arrows://guide/workflow',
  cypherTemplates: 'arrows://spec/cypher-templates',
} as const;

/** Single source of truth — drives both listResources() and readResource() below. */
export const STATIC_RESOURCES: StaticResource[] = [
  {
    uri: RESOURCE_URIS.styleSchema,
    name: 'arrows style-schema (generated from libs/model/styling.ts)',
    description:
      'Every valid style key with its type, default, and accepted values. Source of truth for what AI can set on graph/node/relationship.style.',
    mimeType: 'application/json',
    read: () =>
      JSON.stringify(
        {
          groups: styleAttributeGroups.map((g) => ({
            name: g.name,
            entityTypes: g.entityTypes,
            attributes: g.attributes.map((a) => a.key),
          })),
          attributes: Object.fromEntries(
            Object.entries(styleAttributes).map(([key, attr]) => [
              key,
              {
                type: attr.type,
                defaultValue: attr.defaultValue,
                appliesTo: attr.appliesTo,
              },
            ])
          ),
        },
        null,
        2
      ),
  },
  {
    uri: RESOURCE_URIS.themes,
    name: 'arrows built-in themes',
    description:
      'Curated theme presets from libs/model/themes.ts. Apply with setStyle patch ops.',
    mimeType: 'application/json',
    read: () => JSON.stringify(themes, null, 2),
  },
  {
    uri: RESOURCE_URIS.modelTypes,
    name: 'arrows model TypeScript interfaces',
    description:
      'Shape of Graph, Node, Relationship, Point — what JSON the format-json reader/writer accepts.',
    mimeType: 'text/markdown',
    read: () => MODEL_TYPES_DOC,
  },
  {
    uri: RESOURCE_URIS.conventions,
    name: 'Neo4j property-graph modelling conventions',
    description:
      'Naming + modelling guidance: decision tables, intermediate-node pattern, supernode mitigation, anti-patterns.',
    mimeType: 'text/markdown',
    read: () => CONVENTIONS_DOC,
  },
  {
    uri: RESOURCE_URIS.patchOps,
    name: 'arrows PatchOp catalog',
    description:
      'Every PatchOp variant accepted by apply_patch — required fields, effect, idempotency. Read this before composing ops.',
    mimeType: 'text/markdown',
    read: () => PATCH_OPS_DOC,
  },
  {
    uri: RESOURCE_URIS.cypherMapping,
    name: 'arrows JSON → Cypher mapping',
    description:
      'How arrows property values encode to Cypher literals. Critical: string vs number vs parameter encoding rules. Get this wrong and export_cypher emits broken Cypher.',
    mimeType: 'text/markdown',
    read: () => CYPHER_MAPPING_DOC,
  },
  {
    uri: RESOURCE_URIS.examplesIndex,
    name: 'arrows bundled examples index',
    description:
      'List of fixture graphs with one-line domain summary and the layout algorithm each one showcases. Fetch a fixture by URI: arrows://examples/<name>.',
    mimeType: 'application/json',
    read: () => JSON.stringify(EXAMPLES_INDEX, null, 2),
  },
  {
    uri: RESOURCE_URIS.workflow,
    name: 'arrows workflow guide — recipes + tool ordering',
    description:
      'Ordered playbooks for the common tasks: build a graph from scratch, refactor an existing one, convert to/from Cypher, visualize an unknown graph. READ THIS FIRST before composing tool calls.',
    mimeType: 'text/markdown',
    read: () => WORKFLOW_DOC,
  },
  {
    uri: RESOURCE_URIS.cypherTemplates,
    name: 'Cypher templates — parameterized patterns for Neo4j',
    description:
      'Canonical Cypher patterns aligned with Neo4j 25: MERGE on constrained keys, CYPHER 25 prefix, $params (not literals), LIMIT 25 on exploratory reads, constraint + index DDL.',
    mimeType: 'text/markdown',
    read: () => CYPHER_TEMPLATES_DOC,
  },
];

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

## Starting from scratch — the empty graph

When authoring a brand-new graph via \`apply_patch\`, pass this as the \`graph\` argument:

\`\`\`json
{ "nodes": [], "relationships": [], "style": {} }
\`\`\`

Stringify it: \`'{"nodes":[],"relationships":[],"style":{}}'\`. Then build the whole graph in a single \`apply_patch\` batch.
`;

const WORKFLOW_DOC = `# arrows-code MCP workflow guide

Read this BEFORE composing tool calls. The tools are primitives; the order in which you use them is the whole skill.

## Tool inventory at a glance

| Tool | What it does | When to use |
|---|---|---|
| \`apply_patch\`     | Apply PatchOp[] (addNode, addRelationship, setProperty, renameLabel, …) and return updated JSON. | Authoring + editing. Always preferred over rewriting full JSON. |
| \`layout_graph\`    | Apply force / hierarchical / radial / circular / grid algorithm. Returns graph with new positions. | After authoring nodes. Stop guessing coordinates. |
| \`validate_arrows\` | Parse + structural validation (dangling refs, dup ids, unknown style keys). | After every authoring step. Cheap. |
| \`describe_schema\` | Labels, rel types, properties-by-label, direction frequencies. | Before editing an unfamiliar graph. Before adding a duplicate label. |
| \`render_arrows\`   | SVG image + raw SVG string + diagnostics. | When the user needs to SEE the graph. |
| \`export_cypher\`   | Emit Cypher CREATE statements. | Final step before the user runs it against Neo4j. |

## Resources you should fetch first

For non-trivial work, pull these into context before the first tool call:

- \`arrows://spec/model-types\` — the Graph/Node/Relationship JSON shape
- \`arrows://spec/patch-ops\` — every PatchOp variant + required fields
- \`arrows://spec/cypher-mapping\` — the \`"'Alice'"\` vs \`"42"\` vs \`"$param"\` encoding rule (get this wrong and \`export_cypher\` emits broken output)
- \`arrows://conventions/neo4j\` — naming + per-domain canonical patterns (the audit findings)

For style/layout work also pull:
- \`arrows://spec/style-schema\` — every valid style key
- \`arrows://spec/themes\` — built-in palette presets
- \`arrows://examples/index\` — bundled fixtures with recommended layout per topology

## Playbook 1: Build a graph from scratch (user describes a domain)

1. **Read \`arrows://conventions/neo4j\`** — check for canonical "what's missing" pattern for the domain (e.g. citation graphs need \`:Author\` + \`:Venue\`).
2. **Start from empty graph**: \`{"nodes":[],"relationships":[],"style":{}}\`.
3. **Call \`apply_patch\` ONCE** with all \`addNode\` + \`addRelationship\` ops in a single batch. Coordinates can all be \`(0, 0)\` — layout fixes them.
4. **Call \`validate_arrows\`** — catch typos, dangling refs, unknown style keys before they hit Cypher.
5. **Call \`layout_graph\`** — pick the layout that matches the topology (see Playbook 5).
6. **Call \`render_arrows\`** — show the user.
7. **Optional: \`export_cypher\`** — only if the user asks to deploy.

## Playbook 2: Refactor an existing graph (user pastes a .arrows file)

1. **Call \`describe_schema\`** — see what's already there. Avoid adding duplicate labels or conflicting rel types.
2. **Call \`validate_arrows\`** — surface existing issues so you don't blame yourself for them later.
3. **Plan the change as PatchOp[]** — never rewrite the JSON. Patches preserve positions and styles of nodes you don't touch.
4. **Call \`apply_patch\`** with the ops.
5. **Re-call \`validate_arrows\`** — make sure your patch didn't introduce new diagnostics.
6. **Call \`layout_graph\`** ONLY if you added new nodes (existing nodes already have positions; relaying-out scrambles them).
7. **Call \`render_arrows\`** to show before/after if relevant.

## Playbook 3: Convert a graph to Cypher for deployment

1. **Call \`validate_arrows\`** — \`export_cypher\` doesn't sanity-check; broken JSON in, broken Cypher out.
2. **Skim diagnostics for property-encoding warnings** — see \`arrows://spec/cypher-mapping\`. \`"year": "'1999'"\` exports a string \`'1999'\`, probably not what the user wants.
3. **Call \`export_cypher\`** — paste the result for the user to run against Neo4j.

## Playbook 4: Visualize a graph someone else made

1. **Call \`validate_arrows\`** — confirm the JSON parses.
2. **Call \`describe_schema\`** — explain to the user what's in the graph before showing the picture.
3. **Inspect positions**: if every node has \`position: {x:0,y:0}\` (or all match), call \`layout_graph\` to give it a usable layout. Otherwise respect the author's positions.
4. **Call \`render_arrows\`** — return the SVG.

## Playbook 5: Choosing a layout

Read the topology, then pick:

| Topology | Layout |
|---|---|
| Mostly tree-shaped / clear top→bottom flow / DAG | \`hierarchical\` |
| One central hub with everything else fanning out | \`radial\` |
| Single set of peer nodes, all-to-all-ish, no hierarchy | \`circular\` |
| Mostly disconnected components OR you want a flat catalog view | \`grid\` |
| Anything else / organic / social / mixed | \`force\` (default) |

If unsure: \`force\` is the safe default. The user can re-arrange in VS Code.

## Anti-patterns

- **DON'T** author full Node JSON when \`apply_patch\` is half the tokens and structurally validated.
- **DON'T** invent coordinates. \`layout_graph\` is one call away.
- **DON'T** \`export_cypher\` without \`validate_arrows\` first.
- **DON'T** \`render_arrows\` a graph with all-zero positions — it'll look like a stack of pancakes. Layout first.
- **DON'T** call \`layout_graph\` on a graph the user has already arranged unless they ask for it — relayout is destructive.
- **DON'T** mix authoring and rendering tools in a tight loop with the user — batch authoring + validate, THEN render once.

## Cheap checks you should always run

- After any \`apply_patch\`: \`validate_arrows\` (free, < 50ms).
- After any \`layout_graph\`: nothing — layouts can't introduce semantic errors.
- Before any \`export_cypher\`: \`validate_arrows\` (the property-encoding check is here).
- Before any \`render_arrows\`: nothing required, but if positions look broken, \`layout_graph\` first.
`;

const EXAMPLES_INDEX = {
  examples: [
    {
      name: 'social',
      uri: 'arrows://examples/social',
      layout: 'force',
      domain:
        'Social network — Users following each other, posting + liking + commenting. Classic Neo4j sandbox model.',
    },
    {
      name: 'iam-rbac',
      uri: 'arrows://examples/iam-rbac',
      layout: 'hierarchical',
      domain:
        'IAM permission graph — User→Group→Role→Permission→Resource. Textbook RBAC traversal pattern.',
    },
    {
      name: 'microservices',
      uri: 'arrows://examples/microservices',
      layout: 'hierarchical',
      domain:
        'Service dependency graph — Frontend→Gateway→Service→Foundation→Database, plus pub/sub. Blast-radius queries.',
    },
    {
      name: 'lexical-graph',
      uri: 'arrows://examples/lexical-graph',
      layout: 'radial',
      domain:
        'GraphRAG knowledge graph — Document hub, Chunk ring, Entity outer ring. Uses the canonical __Entity__ label from neo4j-graphrag.',
    },
    {
      name: 'order-lifecycle',
      uri: 'arrows://examples/order-lifecycle',
      layout: 'circular',
      domain:
        'Order state machine — 25 states with cyclic transitions (CANCELLED→REORDERED→DRAFT). Cycle detection over TRANSITIONS_TO.',
    },
    {
      name: 'citations',
      uri: 'arrows://examples/citations',
      layout: 'grid',
      domain:
        'Academic paper citation graph — 30 papers with sparse CITES edges. Sparse/disconnected → grid layout is the right read.',
    },
  ],
} as const;

const PATCH_OPS_DOC = `# PatchOp catalog

\`apply_patch\` accepts a tagged union of operations. Each op is pure: the input graph is never mutated, a new graph is returned.

| Op | Required fields | Effect |
|---|---|---|
| \`addNode\`           | \`id\`, \`x\`, \`y\` (+ optional \`caption\`, \`labels\`, \`properties\`, \`style\`) | Add a new node. \`id\` must be unique. |
| \`removeNode\`        | \`id\` | Remove a node AND every relationship that references it. |
| \`movePos\`           | \`id\`, \`dx\`, \`dy\` | Relative move. |
| \`setPos\`            | \`id\`, \`x\`, \`y\` | Absolute set. |
| \`setCaption\`        | \`id\`, \`caption\` | Replace caption. |
| \`addLabel\`          | \`id\`, \`label\` | Add a Neo4j label (PascalCase). |
| \`removeLabel\`       | \`id\`, \`label\` | Remove a label from one node. |
| \`renameLabel\`       | \`oldLabel\`, \`newLabel\` | Rename label across the whole graph. |
| \`setProperty\`       | \`id\`, \`key\`, \`value\` | Set/replace one property. See cypher-mapping for value encoding. |
| \`removeProperty\`    | \`id\`, \`key\` | Remove a property from one node. |
| \`setStyle\`          | \`id\` (or null for graph-level), \`key\`, \`value\` | Set one style key. \`id: null\` targets \`graph.style\`. |
| \`addRelationship\`   | \`id\`, \`fromId\`, \`toId\`, \`relType\` (+ optional \`properties\`, \`style\`) | Add edge. Both endpoints must exist. Self-loops allowed. |
| \`removeRelationship\`| \`id\` | Remove one edge by id. |
| \`setRelType\`        | \`id\`, \`relType\` | Change type of one edge. |
| \`renameRelType\`     | \`oldType\`, \`newType\` | Rename relationship type across the whole graph. |

## Composition

Ops apply in order: \`apply_patch(graph, [op1, op2])\` ≡ \`apply_patch(apply_patch(graph, [op1]), [op2])\`. Failed ops do NOT short-circuit — every op is attempted, and per-op errors come back in the \`errors\` array.

## Authoring guidance

- **Author by patch, not by full JSON.** When building from scratch, start with an empty graph (\`{nodes:[],relationships:[],style:{}}\`) and emit \`addNode\` + \`addRelationship\` ops. Half the token cost of writing full Node JSON, and each op is structurally validated.
- **Positions can be (0, 0).** Use \`layout_graph\` (if available) or the VS Code "Auto-arrange nodes" command — never guess coordinates.
- **\`setProperty value\` is a string.** Numbers, booleans, and parameters are encoded as described in arrows://spec/cypher-mapping. Get this wrong and \`export_cypher\` emits string \`"42"\` instead of number \`42\`.
`;

const CYPHER_TEMPLATES_DOC = `# Cypher templates — Neo4j 25 patterns

Canonical Cypher snippets aligned with Neo4j modeling/cypher conventions. Use these to translate an arrows graph into deployable Cypher, or to author queries against a graph you've designed in arrows.

All snippets:
- Start with \`CYPHER 25\` (forces the current planner; never put after UNION).
- Use \`$parameters\` — never inline literals.
- Use \`MERGE\` on keys that have a uniqueness constraint (see "Schema DDL" below).
- Default \`LIMIT 25\` on exploratory reads.

## Schema DDL — run BEFORE importing

\`\`\`cypher
// Uniqueness constraint on every label used in MERGE (mandatory for safe MERGE)
CYPHER 25 CREATE CONSTRAINT person_id_unique IF NOT EXISTS
  FOR (p:Person) REQUIRE p.id IS UNIQUE;

// Existence + type constraints (Enterprise only)
CYPHER 25 CREATE CONSTRAINT person_name_exists IF NOT EXISTS
  FOR (p:Person) REQUIRE p.name IS NOT NULL;

// Range index for equality/range filters
CYPHER 25 CREATE INDEX person_name_idx IF NOT EXISTS
  FOR (p:Person) ON (p.name);

// Vector index for embedding similarity (GraphRAG)
CYPHER 25 CREATE VECTOR INDEX chunk_embedding_idx IF NOT EXISTS
  FOR (c:Chunk) ON (c.embedding)
  OPTIONS { indexConfig: { \`vector.dimensions\`: 1536, \`vector.similarity_function\`: 'cosine' } };
\`\`\`

After creating indexes, poll until ONLINE before using them:
\`\`\`cypher
SHOW INDEXES YIELD name, state WHERE state <> 'ONLINE' RETURN name, state;
\`\`\`

## Idempotent node + edge creation (MERGE pattern)

\`\`\`cypher
// Match endpoints by constrained key first, then MERGE the relationship.
CYPHER 25
MATCH (a:Person {id: $aId})
MATCH (b:Person {id: $bId})
MERGE (a)-[r:KNOWS]->(b)
  ON CREATE SET r.since = date()
  ON MATCH  SET r.lastSeen = date();
\`\`\`

## Variable-length traversal (Cypher 25 QPE — not the legacy \`*N..M\`)

\`\`\`cypher
// Shortest path: Alice → Bob through KNOWS, 1..5 hops, return endpoint name.
CYPHER 25
MATCH SHORTEST 1 (a:Person {name: $alice})(()-[:KNOWS]->()){1,5}(b:Person {name: $bob})
RETURN b.name;
\`\`\`

## Cycle detection (skill: order-lifecycle / dependency graphs)

\`\`\`cypher
CYPHER 25
MATCH p = (s:State)-[:TRANSITIONS_TO]->+(s)
RETURN [n IN nodes(p) | n.name] AS cycle LIMIT 25;
\`\`\`

## RBAC permission traversal (skill: iam-rbac)

\`\`\`cypher
// Does $user have $permission via any path of group + role?
CYPHER 25
MATCH (u:User {id: $userId})-[:MEMBER_OF*1..3]->(g:Group)
MATCH (g)-[:HAS_ROLE]->(r:Role)-[:GRANTS]->(p:Permission {name: $permission})
RETURN DISTINCT p.name LIMIT 1;
\`\`\`

## GraphRAG retrieval (skill: lexical-graph)

\`\`\`cypher
// Top-K chunks by vector similarity, follow MENTIONS to entity graph.
CYPHER 25
CALL db.index.vector.queryNodes('chunk_embedding_idx', 10, $queryVec)
YIELD node AS c, score
MATCH (c)-[:MENTIONS]->(e:__Entity__)
RETURN c.text, score, collect(DISTINCT e.name) AS entities
ORDER BY score DESC LIMIT 25;
\`\`\`

## Co-authorship / co-citation (skill: citations)

\`\`\`cypher
// Two-hop co-author: papers Alice wrote AND a co-author also wrote.
CYPHER 25
MATCH (a:Author {name: $alice})-[:WROTE]->(p:Paper)<-[:WROTE]-(co:Author)
WHERE co <> a
RETURN co.name, count(p) AS shared
ORDER BY shared DESC LIMIT 25;
\`\`\`

## Bulk import via CALL IN TRANSACTIONS

\`\`\`cypher
CYPHER 25
LOAD CSV WITH HEADERS FROM 'file:///people.csv' AS row
CALL (row) {
  MERGE (p:Person {id: row.id})
  SET p += row { .name, .email }
} IN TRANSACTIONS OF 1000 ROWS ON ERROR CONTINUE REPORT STATUS AS s;
\`\`\`

## Validation before write (EXPLAIN + read half first)

\`\`\`cypher
// 1. EXPLAIN — no side effects
CYPHER 25 EXPLAIN
MATCH (p:Person {id: $id}) SET p.lastSeen = datetime();

// 2. Verify read half as RETURN before replacing with SET
CYPHER 25 MATCH (p:Person {id: $id}) RETURN p.id, p.lastSeen LIMIT 1;
\`\`\`

## Common traps (Neo4j cypher skill)

| Wrong | Right |
|---|---|
| \`shortestPath((a)-[*]->(b))\` | \`SHORTEST 1 (a)(()-[]->()){1,}(b)\` |
| \`[:REL*1..5]\` | \`(()-[:REL]->()){1,5}\` |
| \`CALL { WITH x ... }\` | \`CALL (x) { ... }\` |
| \`id(n)\` | \`elementId(n)\` |
| \`-- comment\` | \`// comment\` |
| \`SET n = {…}\` (replaces all) | \`SET n += {…}\` (partial) |
| \`DELETE n\` with rels | \`DETACH DELETE n\` |
| \`WHERE n.x = null\` | \`WHERE n.x IS NULL\` |
`;

const CYPHER_MAPPING_DOC = `# arrows JSON → Cypher property mapping

Property *values* in arrows JSON are always strings, but they encode different Cypher literal types depending on shape. The \`export_cypher\` tool uses these rules to emit valid Cypher.

The encoder inspects the string and picks one Cypher literal type per these rules (in priority order, first match wins):

| Property value in JSON | Cypher emits | Notes |
|---|---|---|
| \`"42"\`, \`"3.14"\`, \`"-7"\` | \`42\`, \`3.14\`, \`-7\` | Any string that \`parseFloat\` accepts → bare number. |
| \`"true"\` / \`"false"\`        | \`true\` / \`false\` | Bare Cypher boolean. |
| \`"null"\`                     | \`null\`          | Bare Cypher null. |
| \`"$paramName"\`               | \`$paramName\`    | Parameter reference. Matches \`^\\$[A-Za-z_][A-Za-z0-9_]*$\`. |
| \`"'Alice'"\`                  | \`'Alice'\`       | Single-quoted-inside-double-quoted = canonical "Cypher single-quoted string literal" passthrough. |
| \`"date('2024-01-15')"\`       | \`date('2024-01-15')\` | Cypher function call passthrough. Supported: \`date\`, \`datetime\`, \`localdatetime\`, \`time\`, \`localtime\`, \`duration\`, \`point\`. |
| \`"Alice"\`                    | \`"Alice"\`       | Anything else → double-quoted Cypher string, with \`\\\\\` + \`"\` escaped. |

## Examples

| arrows property | Cypher output | Comment |
|---|---|---|
| \`{ "name": "Alice" }\`            | \`name: "Alice"\`             | Plain string. |
| \`{ "name": "'Alice'" }\`          | \`name: 'Alice'\`             | Single-quoted Cypher string — same value, alternate quoting. |
| \`{ "year": "1999" }\`             | \`year: 1999\`                | Integer. |
| \`{ "active": "true" }\`           | \`active: true\`              | Boolean. |
| \`{ "owner": "$ownerId" }\`        | \`owner: $ownerId\`           | Parameter reference. |
| \`{ "createdAt": "date('2024-01-15')" }\` | \`createdAt: date('2024-01-15')\` | Function call. |
| \`{ "note": "true alert" }\`       | \`note: "true alert"\`        | Defensive: must equal \`true\` exactly to become bool. |

## Round-trip guarantee

\`writeGraph(readGraph(text))\` is byte-stable (modulo whitespace). The encoder is the only step that interprets string values — \`format-json\` is opaque pass-through.

## Recommendations

- **Default to plain strings**: \`"Alice"\`. The renderer emits a Cypher string either way; you almost never need the single-quoted variant.
- **Use \`$param\` only when you want the Cypher to be parameterized** (deployable with bound parameters, not literals). Default to plain values otherwise.
- **Use \`date(...)\` / \`datetime(...)\` for temporal data** instead of strings like \`"2024-01-15"\`. The latter exports as a Cypher string, not a temporal type — no range queries work.
- **Booleans are bare**: \`"true"\` not \`"'true'"\` and not \`"True"\`.
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

## Node vs Relationship vs Property — decision table

| Question | Answer | Model as |
|---|---|---|
| Is it a thing with identity, queried as entry point? | Yes | Node |
| Is it a connection between two things with direction? | Yes | Relationship |
| Does the connection have its own properties or multiple targets? | Yes | **Intermediate node** |
| Is it a scalar always returned with its parent, never filtered alone? | Yes | Property on parent |
| Is it a category used for type-based filtering or path traversal? | Yes | Label (not a property) |
| Does the same attribute value repeat across many nodes (low cardinality)? | Yes | Label, not a property node |
| Is it a fact connecting >2 entities? | Yes | Intermediate node |

## Property vs Label — decision table

| Use label when | Use property when |
|---|---|
| Values are few, fixed, used as traversal filters (\`WHERE n:Active\`) | Values are many, dynamic, or unique per node |
| You traverse by type (\`MATCH (n:VIPCustomer)\`) | You filter by value (\`WHERE n.tier = 'vip'\`) |
| Example: \`:Active\`, \`:Verified\`, \`:Premium\` | Example: \`status\`, \`score\`, \`email\` |

Rule: adding a label is cheap; scanning all \`:Label\` nodes is fast. **Never model high-cardinality values as labels.**

## Intermediate node pattern

Promote a relationship to an intermediate node when it has >2 properties, is queried independently, or connects >2 entities.

**Before** (lossy): \`(:Person)-[:ACTED_IN {role: "Neo"}]->(:Movie)\` — can't query roles without going through movies.

**After** (queryable): \`(:Person)-[:PLAYED]->(:Role {name: "Neo"})-[:IN]->(:Movie)\` — \`MATCH (r:Role) WHERE r.name STARTS WITH 'Neo'\` now works.

## Supernode mitigation

Nodes with >100K relationships degrade every query that passes through them. Avoid by:

- **Don't model low-cardinality categoricals as nodes.** \`:Status {name: "active"}\` connected to a million orders is a supernode. Use a label \`:Active\` or a property \`status: 'active'\` instead.
- **Type-split.** If one supernode serves multiple roles, split the rel types (\`:FOLLOWS\` + \`:FAN\` instead of one \`:RELATED_TO\`).
- **Bucket pattern for time-series.** \`(u:User)-[:VIEWED_IN]->(b:ViewBucket {hour: '2025-04-28T14'})-[:VIEWED]->(p:Page)\` — queries last hour without traversing full history.

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Generic labels \`:Entity\`, \`:Node\`, \`:Thing\` | No filtering benefit | Use domain labels (\`:Person\`, \`:Order\`) |
| Generic rel types \`:RELATED_TO\`, \`:HAS\` | Can't filter by type | Use semantic types (\`:PURCHASED\`, \`:AUTHORED\`) |
| Low-cardinality value as node | Supernode | Use label or property |
| Property as label AND duplicate property (\`n.type='VIP'\` + \`:VIP\`) | Inconsistency | Pick one — prefer label if used in traversal |
| Embeddings on business node | Slow traversal, bloated nodes | Dedicated \`:Chunk\` node with \`embedding\` property |
| MERGE without uniqueness constraint | Silent duplicate nodes | Add \`CREATE CONSTRAINT … REQUIRE x.key IS UNIQUE\` first |
| \`id\` as property name | Conflicts with driver's internal \`elementId(n)\` | Use \`personId\`, \`movieId\`, \`tmdbId\` |
| Dates stored as plain strings | No range queries, no temporal operators | Use \`"date('…')\` / \`"datetime('…')\` (passthrough — see cypher-mapping) |
| Symmetric rel modeled both directions | Double-counts on traversal | One direction; query undirected at read time |
| Booleans modeled as labels (\`:ActiveUser\`) | Inflates label count | Property \`active: true\` |

## Embeddings (GraphRAG)

Store embeddings on dedicated \`:Chunk\` nodes, NEVER on business nodes:

\`\`\`
(:Document)-[:HAS_CHUNK]->(:Chunk { text, embedding, chunkIndex })
\`\`\`

- Chunk size 200-500 tokens with ~20% overlap is the production default.
- Vector index goes on \`Chunk.embedding\` only.
- Don't put \`embedding\` on \`:Document\` — pollutes traversal queries and bloats the node.

## Property value encoding for Cypher

Property values are JSON strings, but the encoder interprets them as Cypher literals. The shape rules are in arrows://spec/cypher-mapping — read it before authoring properties. Common forms:

| arrows JSON | Cypher emits |
|---|---|
| \`"Alice"\` | \`"Alice"\` (double-quoted string) |
| \`"42"\` | \`42\` (integer) |
| \`"true"\` | \`true\` (boolean) |
| \`"$ownerId"\` | \`$ownerId\` (parameter) |
| \`"date('2024-01-15')"\` | \`date('2024-01-15')\` (function call) |

## Canonical "what's missing" patterns

These come up repeatedly in real Neo4j workshops. If your graph maps to one of these domains, include the entities below — otherwise you misrepresent the use case:

- **Social / content** — reify comments as their own \`:Comment\` nodes. \`(:User)-[:POSTED]->(:Comment)-[:ON]->(:Post)\`. Don't put comment text on a \`:COMMENTED_ON\` relationship — that limits you to one comment per user-post pair.
- **Citations / academic** — always include \`:Author\` and \`:Venue\` nodes. \`(:Author)-[:WROTE]->(:Paper)-[:PUBLISHED_IN]->(:Venue)\`, \`(:Paper)-[:CITES]->(:Paper)\`. Without \`:Author\`, co-authorship + co-citation traversals (the whole point of a citation graph in Neo4j) become impossible.
- **GraphRAG / lexical** — use the \`__Entity__\` double-underscore label (it's a real \`neo4j-graphrag\` convention). \`(:Document)<-[:FROM_DOCUMENT]-(:Chunk)-[:NEXT_CHUNK]->(:Chunk)\`, \`(:Chunk)-[:MENTIONS]->(:__Entity__)\`. Include an \`embedding\` property on \`:Chunk\` even as a placeholder.
- **Order lifecycle** — Neo4j models instance data, not meta-graphs. Prefer \`(:Order {status: 'SHIPPED'})\` or \`(:Order)-[:HAS_STATUS]->(:Status)\` over a pure states-as-nodes schema. If you do model the state machine itself, document explicitly that this is a schema diagram, not Neo4j data.
- **Microservices / IT** — \`:Database\` is reserved for actual databases. A Kafka topic is \`:MessageBroker\` or \`:Topic\`. Avoid invented categories like \`:Foundation\` — Neo4j docs use multi-label patterns like \`:Service:Core\` instead.
- **IAM / RBAC** — include role inheritance edges \`(:Role)-[:INHERITS]->(:Role)\`. Recursive role-resolution is exactly what graph traversal does better than SQL.

## Property type discipline

Audit catch: \`{"terminal": "true"}\` exports as \`terminal: true\` (boolean — correct). But \`{"terminal": "'true'"}\` exports as the string \`'true'\` (wrong). Likewise numbers: \`{"year": "1999"}\` → integer, \`{"year": "'1999'"}\` → string. See arrows://spec/cypher-mapping.

## When to prefer arrows-code MCP tools

- **Always \`describe_schema\` before adding entities** — confirms the label/type doesn't already exist.
- **Use \`apply_patch\`, never rewrite the whole file** — token-cheap and preserves positions/styles of nodes you didn't touch.
- **Run \`validate_arrows\` after every change** — surfaces dangling rels, duplicate ids, unknown style keys.
- **Use \`export_cypher\` to deploy** — same emission path arrows.app uses, guaranteed parity.
`;
