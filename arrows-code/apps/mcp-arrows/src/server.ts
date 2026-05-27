#!/usr/bin/env node
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import {
  applyPatch,
  applyPatchInputShape,
  applyPatchOutputShape,
  describeSchema,
  describeSchemaOutputShape,
  exportArrowsCypher,
  exportCypherOutputShape,
  graphInputShape,
  layoutGraph,
  layoutGraphOutputShape,
  layoutInputShape,
  renderArrows,
  renderArrowsOutputShape,
  validateArrows,
  validateArrowsOutputShape,
} from './lib/tools';
import {
  STATIC_RESOURCES,
  listExampleFixtures,
  readExampleFixture,
} from './lib/resources';

const server = new McpServer({ name: 'arrows-code', version: '0.0.1' });

// ───────────────────────── Tools ─────────────────────────
// Each tool's input + output shape is a Zod raw shape. The SDK:
//   - generates the JSON schema clients see (no hand-maintained constants)
//   - validates the call args against inputSchema
//   - validates our returned structuredContent against outputSchema
// Failures throw — SDK auto-converts to { isError: true }.

server.registerTool(
  'render_arrows',
  {
    title: 'Render arrows graph to SVG',
    description:
      'Render an arrows graph (native JSON) to SVG. Returns an inline image content block (image/svg+xml, base64) for image-rendering clients AND a structuredContent block with { svg, width, height, diagnostics } for programmatic callers.',
    inputSchema: graphInputShape,
    outputSchema: renderArrowsOutputShape,
  },
  async (args) => {
    const out = await renderArrows(args);
    const data = Buffer.from(out.svg, 'utf8').toString('base64');
    return {
      content: [
        { type: 'image', data, mimeType: 'image/svg+xml' },
        { type: 'text', text: JSON.stringify(out) },
      ],
      structuredContent: out,
    };
  }
);

server.registerTool(
  'validate_arrows',
  {
    title: 'Validate arrows graph',
    description:
      'Parse + structurally validate a graph. Surfaces parse errors plus duplicate ids, dangling relationship references, missing required fields, and unknown style keys. Never throws.',
    inputSchema: graphInputShape,
    outputSchema: validateArrowsOutputShape,
  },
  async (args) => {
    const out = await validateArrows(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(out) }],
      structuredContent: out,
    };
  }
);

server.registerTool(
  'apply_patch',
  {
    title: 'Apply PatchOps to a graph',
    description:
      'Apply structured edit ops (addNode, removeNode, movePos, setCaption, setProperty, addRelationship, renameLabel, renameRelType, etc.) to a graph and return the new graph JSON. Token-cheap alternative to rewriting whole files. See arrows://spec/patch-ops for op semantics.',
    inputSchema: applyPatchInputShape,
    outputSchema: applyPatchOutputShape,
  },
  async (args) => {
    const out = applyPatch(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(out) }],
      structuredContent: out,
    };
  }
);

server.registerTool(
  'layout_graph',
  {
    title:
      'Auto-arrange graph (force / hierarchical / radial / circular / grid)',
    description:
      'Apply one of five layout algorithms to a graph and return it with new positions. Same algorithms the VS Code "Auto-arrange nodes" command runs. Stop guessing coordinates. See arrows://guide/workflow for which layout fits which topology.',
    inputSchema: layoutInputShape,
    outputSchema: layoutGraphOutputShape,
  },
  async (args) => {
    const out = await layoutGraph(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(out) }],
      structuredContent: out,
    };
  }
);

server.registerTool(
  'describe_schema',
  {
    title: 'Extract graph schema',
    description:
      'Extract the schema (labels, relationship types, properties per label, direction frequency) from a graph. Use before adding entities to avoid duplicating labels that already exist.',
    inputSchema: graphInputShape,
    outputSchema: describeSchemaOutputShape,
  },
  async (args) => {
    const out = describeSchema(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(out) }],
      structuredContent: out,
    };
  }
);

server.registerTool(
  'export_cypher',
  {
    title: 'Export graph as Cypher CREATE',
    description:
      'Emit Cypher CREATE statements for the graph. Uses the same generator arrows.app ships, so output deploys cleanly to a real Neo4j database. Property value encoding: see arrows://spec/cypher-mapping.',
    inputSchema: graphInputShape,
    outputSchema: exportCypherOutputShape,
  },
  async (args) => {
    const out = exportArrowsCypher(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(out) }],
      structuredContent: out,
    };
  }
);

// ───────────────────────── Resources ─────────────────────────
// Static resources from STATIC_RESOURCES (the single source of truth) — one
// registerResource call each. Dynamic example fixtures use a ResourceTemplate
// so clients can list and read them without us hand-coding URI parsing.

for (const r of STATIC_RESOURCES) {
  server.registerResource(
    r.uri.replace(/^arrows:\/\//, '').replace(/\//g, '-'),
    r.uri,
    { title: r.name, description: r.description, mimeType: r.mimeType },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: r.mimeType, text: r.read() }],
    })
  );
}

server.registerResource(
  'examples-fixture',
  new ResourceTemplate('arrows://examples/{name}', {
    list: async () => ({
      resources: listExampleFixtures().map((e) => ({
        uri: e.uri,
        name: e.name,
        mimeType: 'application/json',
      })),
    }),
  }),
  {
    title: 'arrows bundled example fixture',
    description:
      'A bundled .arrows graph (social, iam-rbac, microservices, lexical-graph, order-lifecycle, citations). Same files shipped by the VS Code extension.',
    mimeType: 'application/json',
  },
  async (uri, variables) => {
    const name = Array.isArray(variables['name'])
      ? variables['name'][0]
      : variables['name'];
    const fixture = readExampleFixture(String(name));
    if (!fixture) throw new Error(`Unknown example: ${name}`);
    return {
      contents: [
        { uri: uri.href, mimeType: fixture.mimeType, text: fixture.text },
      ],
    };
  }
);

// ───────────────────────── Prompts ─────────────────────────
// Three high-leverage starter prompts. Clients surface these as slash-commands
// so users get the workflow recipe without having to read the docs first.

server.registerPrompt(
  'from-description',
  {
    title: 'Build a graph from a domain description',
    description:
      'Generate an arrows graph from a prose description. Pre-loads modelling conventions and the patch-ops API so the LLM uses the canonical authoring loop.',
    argsSchema: {
      domain: z
        .string()
        .describe(
          'Free-text description of the domain to model (e.g. "a SaaS subscription system with customers, plans, invoices").'
        ),
    },
  },
  ({ domain }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are authoring a Neo4j property graph using the arrows-code MCP server. The user's domain is:

"""
${domain}
"""

Follow Playbook 1 from arrows://guide/workflow:

1. Read these resources first to ground your modelling:
   - arrows://conventions/neo4j  (naming, intermediate-node pattern, anti-patterns)
   - arrows://spec/patch-ops      (every op variant)
   - arrows://spec/cypher-mapping (property value encoding — gets booleans/dates right)

2. Start from an empty graph: \`{"nodes":[],"relationships":[],"style":{}}\`.
3. Author the whole graph in a SINGLE apply_patch call (one batch of addNode + addRelationship ops). Positions can all be (0, 0).
4. Run validate_arrows — must come back with zero error diagnostics.
5. Run layout_graph with the algorithm that fits the topology (hierarchical for tiers/DAGs, radial for hubs, force otherwise).
6. Run render_arrows to show the user.
7. Optionally run export_cypher and offer the Cypher for deployment.

Return the final graph JSON plus a short summary of the labels and relationship types you chose and why.`,
        },
      },
    ],
  })
);

server.registerPrompt(
  'from-cypher',
  {
    title: 'Build a graph from Cypher CREATE statements',
    description:
      'Translate a Cypher CREATE block into an arrows graph. Useful when the user already has Cypher and wants to visualize / refactor it.',
    argsSchema: {
      cypher: z.string().describe('One or more Cypher CREATE statements.'),
    },
  },
  ({ cypher }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Convert this Cypher into an arrows graph using the MCP server. Read arrows://spec/cypher-mapping first so you reverse-encode property values correctly (Cypher \`true\` → arrows JSON \`"true"\`, \`42\` → \`"42"\`, \`$p\` → \`"$p"\`, \`date(...)\` → \`"date(...)"\`, double-quoted strings → plain string value).

\`\`\`cypher
${cypher}
\`\`\`

Workflow:
1. Parse the Cypher in your head; identify each \`(:Label {prop: value})\` and \`-[:REL_TYPE {prop: value}]->\` pattern.
2. Start from an empty graph and apply_patch a single batch of addNode + addRelationship ops.
3. Run validate_arrows.
4. Run layout_graph (force is a safe default).
5. Run render_arrows.
6. Re-run export_cypher and diff against the input — round-trip should preserve labels, rel types, and property values.`,
        },
      },
    ],
  })
);

server.registerPrompt(
  'review-graph',
  {
    title: 'Audit a graph against Neo4j conventions',
    description:
      'Run an audit on a graph: naming, anti-patterns, missing canonical entities per domain, property-value encoding. Mirrors the assessment format from the Neo4j modelling skill.',
    argsSchema: {
      graph: z.string().describe('arrows native JSON as a string.'),
    },
  },
  ({ graph }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Audit this arrows graph against Neo4j modelling conventions. Read arrows://conventions/neo4j first — it has the decision tables, anti-pattern catalogue, and per-domain "what's missing" patterns.

\`\`\`json
${graph}
\`\`\`

For each issue you find, output:
- Severity (ERROR / WARNING / INFO)
- Current state (what the model does)
- Problem (why it's an issue, referencing the convention)
- Fix (specific PatchOp[] or model change)

Also run describe_schema and validate_arrows to surface structural issues. Return the audit as the structured report described in the conventions doc.`,
        },
      },
    ],
  })
);

// ───────────────────────── Transport ─────────────────────────
const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  process.stderr.write(
    `[mcp-arrows] server.connect failed: ${
      err instanceof Error ? err.stack ?? err.message : String(err)
    }\n`
  );
  process.exit(1);
});
