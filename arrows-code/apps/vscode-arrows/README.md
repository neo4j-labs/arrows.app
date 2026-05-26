# Arrows for VS Code

The arrows.app canvas, in a VS Code tab.

Open a `.arrows` file and you get the same editor you'd use at arrows.app — drag nodes around, double-click to edit, drag from a node's ring to draw a relationship. The JSON stays in sync, so your data model can live in git next to the code that reads from it.

## What it does

- Canvas editor for `.arrows` files. Same engine arrows.app runs, embedded.
- Two-way sync. The text and the canvas stay in sync. JSON keys are sorted so diffs are readable.
- Select / Pan / Zoom. **V** for select, **H** for pan (or hold Space), scroll to zoom.
- Double-click empty space adds a node. Double-click a node or relationship to edit it inline.
- Context menus that know what you clicked: nodes get Edit / Duplicate / Delete, relationships add Reverse, empty canvas gets "New node here."
- Cypher export, with escaping that holds up against backticks and quotes in your labels and values.
- SVG export through the same primitives the web app uses.
- A validator that flags duplicate ids, broken relationships, and unknown style keys in the Problems panel.
- Project-wide rename for labels and relationship types.
- Sidebar with your `.arrows` files, seven bundled examples, and quick actions.

## Install

```bash
code --install-extension arrows-code-vscode-arrows.vsix
```

Or search "Arrows" in the Extensions view, once it's published.

## Getting started

`Cmd+Shift+P` → `Arrows: New Graph`. The canvas opens. From there:

- Drag from a node's ring to draw a relationship to another node.
- Double-click empty space to add a node.
- Right-click anything for the relevant context menu.
- `Arrows: Open as JSON Source` if you want the underlying JSON. Edit either view — both stay in sync.

## Keyboard shortcuts

Throughout the tables below, **Cmd** = ⌘ on macOS, **Ctrl** on Windows / Linux. **Alt** = Option on macOS. The extension picks the right one at runtime.

### Canvas tools

| Key | Does |
|---|---|
| V | Select |
| H | Pan |
| Space (hold) | Temporary pan |
| Wheel | Zoom |

### Graph editing

| Key | Does |
|---|---|
| Delete / Backspace | Delete selection |
| Cmd/Ctrl+D | Duplicate selection |
| Cmd/Ctrl+A | Select all |
| Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z | Undo, redo |
| Arrows | Jump to neighbouring node |
| Enter | Inline-edit the selection |
| Double-click | Create a node where you click |

### Workspace

| Key | Does |
|---|---|
| Cmd/Ctrl+K V | Open preview to the side (from the JSON view) |
| Shift+Alt+F | Format the JSON (Alt = Option on macOS) |

## Commands

All available from `Cmd+Shift+P`. Most are also on the right-click menus.

| Command | What it does |
|---|---|
| Arrows: New Graph | New untitled `.arrows` with a starter graph |
| Arrows: Open as JSON Source | Switch a preview tab to the JSON view |
| Arrows: Open Preview to the Side | Open the canvas in a side editor |
| Arrows: Format / Canonicalize | Sort keys, normalize whitespace |
| Arrows: Validate | Run the validator |
| Arrows: Export as SVG… | Save the graph as `.svg` |
| Arrows: Export as Cypher… | Save as Cypher `CREATE` statements |
| Arrows: Copy Cypher to Clipboard | Same, to the clipboard |
| Arrows: Open in arrows.app | Open the active graph in the [arrows.app](https://arrows.app) web editor via a `#/import/json=…` URL hash. Useful for sharing or for picking up where you left off on a machine without VS Code. |
| Arrows: Rename Label… | Rename a label across every node |
| Arrows: Rename Relationship Type… | Rename a type across every relationship |
| Arrows: Delete Graph File… | Trash a `.arrows` file (right-click in the sidebar) |

## Bundled examples

The sidebar's Examples section ships with seven graphs covering the patterns Neo4j users actually model.

| Example | What it shows |
|---|---|
| social | Person ↔ Person (FOLLOWS), Person → Post |
| movies | The classic ACTED_IN / DIRECTED tutorial graph |
| iam-rbac | User → Group → Role → Permission → Resource |
| ecommerce-orders | Customer → Order → Product → Category, plus VIEWED |
| fraud-ring | Account → TRANSFERRED → Account ring with a shared Device |
| knowledge-graph | People, organizations, places, concepts |
| lexical-graph | The GraphRAG pattern: Document → HAS_CHUNK → Chunk → MENTIONS → `__Entity__` |

Labels are PascalCase, relationship types SCREAMING_SNAKE_CASE, properties camelCase. So the generated Cypher reads the way Neo4j docs and examples do.

## File format

The on-disk format is plain JSON, same as arrows.app:

```json
{
  "style": { "node-color": "#ffe081" },
  "nodes": [
    { "id": "n0", "position": { "x": 0, "y": 0 }, "caption": "Alice", "labels": ["Person"], "properties": { "name": "'Alice'" }, "style": {} }
  ],
  "relationships": [
    { "id": "r0", "fromId": "n0", "toId": "n1", "type": "KNOWS", "properties": {}, "style": {} }
  ]
}
```

Files saved here open in arrows.app and the other way around.

## How sync works

If you've ever used a two-way editor and watched it revert your own edits, you know why this matters. The bridge keeps a short history of what it has emitted; anything the host posts back that matches one of those is recognized as our own echo and skipped. Loads that arrive mid-drag or mid-edit get queued until you let go. Details in `docs/SYNC.md` if you want the protocol.

## FAQ

**Offline?**
Yes. Nothing phones home.

**Does it round-trip with arrows.app?**
Yes — same format.

**Google Drive?**
No. This treats `.arrows` files as workspace files. Use the web app if you want Drive.

**Undo?**
The canvas has redux-undo for graph ops. VS Code's undo handles the document text. They don't share a stack — undoing in one doesn't roll back the other. In practice that's fine; you usually want one or the other.

**MCP?**
There's a companion `@neo4j-labs/mcp-arrows` that exposes the engine to AI agents. Separate install.

## Limitations

- PNG export — not yet. Export SVG and convert.
- Themes panel — not yet. Style keys can be set in JSON.
- Copy/paste between graph files — not yet.
- The format supports "gangs" of nodes; the UI doesn't surface them.

## Issues

https://github.com/neo4j-labs/arrows.app/issues — please include VS Code version, OS, the `.arrows` file (or a minimal repro), and what you expected vs what happened.

## License

Apache-2.0.
