# Arrows for VS Code

The arrows.app canvas, inside a VS Code tab. Open a `.arrows` file and you get the editor from arrows.app - drag nodes, draw relationships, edit inline. The underlying JSON stays in sync so your graph models can live in git next to the code that uses them.

![Canvas editor with the inspector showing a selected node](https://raw.githubusercontent.com/AndreAtNeo4j/arrows.app/feature/vcode-ext-mcp-server/arrows-code/apps/vscode-arrows/media/screenshots/canvas.png)

## Features

- Canvas editor for `.arrows` files
- Two-way sync between canvas and JSON (open both, edit either)
- Cypher and SVG export
- Validator that flags broken graphs in the Problems panel
- Project-wide rename for labels and relationship types
- Sidebar with your workspace's `.arrows` files plus six bundled examples

## Install

```bash
code --install-extension arrows-code-vscode-arrows.vsix
```

Or search for "Arrows" in the Extensions view.

## Getting started

`Cmd+Shift+P` → `Arrows: New graph`. The canvas opens. From there:

- Drag from a node's ring to draw a relationship.
- Double-click empty space to add a node.
- Right-click anything for the relevant menu.
- `Arrows: Show JSON side by side` to see the underlying file.

Press **`?`** inside the canvas to see all shortcuts.

## Shortcuts

| | macOS | Windows / Linux |
|---|---|---|
| Select / Pan tool | V / H (or hold Space) | V / H (or hold Space) |
| Add node | Double-click empty | Double-click empty |
| Draw relationship | Drag from node ring | Drag from node ring |
| Add to selection | Shift+click | Shift+click |
| Delete | Delete / Backspace | Delete / Backspace |
| Zoom | Wheel | Wheel |
| Show JSON side by side | ⌘K V | Ctrl+K V |
| Auto-arrange nodes | ⇧⌥F | Shift+Alt+F |

![Canvas and JSON file open side by side](https://raw.githubusercontent.com/AndreAtNeo4j/arrows.app/feature/vcode-ext-mcp-server/arrows-code/apps/vscode-arrows/media/screenshots/sync.png)

![Sidebar with workspace files, bundled examples, and quick actions](https://raw.githubusercontent.com/AndreAtNeo4j/arrows.app/feature/vcode-ext-mcp-server/arrows-code/apps/vscode-arrows/media/screenshots/sidebar.png)

## Bundled examples

| Example | Layout |
|---|---|
| social | Force-directed |
| iam-rbac | Hierarchical |
| microservices | Hierarchical |
| lexical-graph (GraphRAG) | Radial |
| order-lifecycle | Circular |
| citations | Grid |

Labels are PascalCase, relationship types SCREAMING_SNAKE_CASE, properties camelCase. Cypher you export uses the same conventions Neo4j docs use.

## File format

Plain JSON, same format arrows.app uses. Files open in either tool.

## FAQ

**Does it phone home?** No. It's local.

**Does it round-trip with arrows.app?** Yes - same format.

**Google Drive?** No. This treats `.arrows` as workspace files. Use the web app for Drive.

## Issues

[github.com/neo4j-labs/arrows.app/issues](https://github.com/neo4j-labs/arrows.app/issues) - please include your VS Code version, OS, and a small repro.

## License

Apache-2.0.
