# mcp-arrows

Model Context Protocol server that exposes the arrows.app graph engine to AI agents. Lets Claude / Cursor / Copilot author, refactor, validate, and render Neo4j property-graph models at intent level — no Cypher hallucination, no broken JSON.

## What it does

Provides tools and read-only resources over MCP's stdio transport:

### Tools

| Tool | Purpose |
|---|---|
| `render_arrows` | Render a graph to SVG. Returns an inline image content block (image/svg+xml, base64) AND a JSON text block with `{ svg, width, height, diagnostics }`. One tool covers both image clients and programmatic callers. |
| `validate_arrows` | Run the structural + style validator. Returns `{ diagnostics }`. |
| `apply_patch` | Apply a list of `PatchOp`s (addNode, setProperty, renameLabel, …) to a graph and return the updated JSON. |
| `layout_graph` | Apply force / hierarchical / radial / circular / grid algorithm — same five as the VS Code "Auto-arrange nodes" command. Stop guessing coordinates. |
| `describe_schema` | Extract labels, relationship types, properties, and direction summaries from a graph. |
| `export_cypher` | Emit Cypher `CREATE` statements with proper identifier and string escaping. |

### Resources

| URI | Contents |
|---|---|
| `arrows://spec/style-schema` | Every recognized style key + its expected value type. Generated from `@neo4j-arrows/model` so it never drifts. |
| `arrows://spec/themes` | Built-in palette themes. |
| `arrows://spec/model-types` | TypeScript signatures for `Graph`, `Node`, `Relationship`. |
| `arrows://spec/patch-ops` | Catalog of every `PatchOp` variant — required fields, effect, composition rules. Read before composing ops. |
| `arrows://spec/cypher-mapping` | How arrows property values encode to Cypher literals (the `"'Alice'"` vs `"42"` vs `"$param"` rule). |
| `arrows://conventions/neo4j` | Naming + modelling conventions, plus canonical "what's missing" patterns per domain (social, citations, GraphRAG, IAM, microservices, state machines). |
| `arrows://examples/index` | List of bundled fixtures with domain summary and recommended layout. Fetch a fixture by `arrows://examples/<name>`. |
| `arrows://guide/workflow` | Ordered playbooks: build from scratch, refactor, export to Cypher, visualize unknown graphs. **Read this first** — the tools are primitives; ordering is the skill. |

## Install

```bash
npm install -g @neo4j-labs/mcp-arrows
```

(Or use it directly via `npx @neo4j-labs/mcp-arrows`.)

## Use with Claude Code

```bash
claude mcp add arrows -- npx -y @neo4j-labs/mcp-arrows
```

Then in a Claude Code session you can ask things like:

> Model a Twitter-like graph with Users, Tweets, Likes, Follows. Lay it out nicely and pick a palette.

Claude will use `apply_patch` to build the graph, `describe_schema` to verify it, and `validate_arrows` to catch missing relationship types or unknown style keys before handing back the final JSON.

## Use with Cursor / Copilot Chat

Add to your MCP config (location depends on the client):

```json
{
  "mcpServers": {
    "arrows": {
      "command": "npx",
      "args": ["-y", "@neo4j-labs/mcp-arrows"]
    }
  }
}
```

## Example interaction

```
> apply_patch ops=[
    { type: 'addNode', id: 'n0', x: 0, y: 0, caption: 'Alice', labels: ['Person'] },
    { type: 'addNode', id: 'n1', x: 200, y: 0, caption: 'Bob', labels: ['Person'] },
    { type: 'addRelationship', id: 'r0', fromId: 'n0', toId: 'n1', relType: 'KNOWS' }
  ]

→ { graph: "{ ...JSON... }", errors: [] }

> render_arrows graph=...

→ { svg: "<svg …>", width: 320, height: 80, diagnostics: [] }

> export_cypher graph=...

→ { cypher: "CREATE (alice:Person {name: 'Alice'})-[:KNOWS]->(bob:Person {name: 'Bob'})" }
```

## File format

The MCP server reads and writes the same `.arrows` JSON the [VS Code extension](../vscode-arrows/README.md) and [arrows.app](https://arrows.app) use. Graphs round-trip across all three surfaces byte-for-byte.

## Security

Cypher generation properly escapes backticks in identifiers and backslash / quote in string values — graphs containing user-controlled label or property data won't produce injectable Cypher. See `libs/format-cypher/src/lib/injection.spec.js` for the regression suite.

`apply_patch` validates each operation through a Zod discriminated union before touching the graph — malformed or unknown op types return an error rather than corrupting state.

## License

Apache-2.0.
