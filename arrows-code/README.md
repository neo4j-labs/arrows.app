# arrows-code

VS Code extension + MCP server that bring arrows.app into the developer's text editor and to AI coding agents.

This is a self-contained subsystem inside the `arrows.app` monorepo. Deleting `arrows-code/` removes both deliverables cleanly — the parent web app is untouched.

## Two surfaces, one engine

| | |
|---|---|
| **[apps/vscode-arrows](apps/vscode-arrows/README.md)** | VS Code extension. Custom editor for `.arrows` files with the full arrows.app canvas embedded. |
| **[apps/mcp-arrows](apps/mcp-arrows/README.md)** | MCP server. Exposes the same engine over stdio for Claude / Cursor / Copilot. |

Both surfaces share `libs/` (format converters, validator, patch ops, renderer host), and both reuse arrows.app's existing rendering code (`@neo4j-arrows/{model,graphics,selectors}`) — no parallel implementation, no logic drift.

## Layout

```
arrows-code/
├── apps/
│   ├── vscode-arrows/    VS Code extension (CustomTextEditorProvider + commands + sidebar)
│   └── mcp-arrows/       MCP server (stdio, 5 tools, 4 resources)
├── libs/
│   ├── format-json/      read/write canonical .arrows JSON, deterministic output
│   ├── format-cypher/    Cypher CREATE/MERGE export with injection-hardened escapes
│   ├── patch/            PatchOp types + pure apply()
│   ├── renderer-host/    headless SVG via @neo4j-arrows/graphics (jsdom-shimmed in Node)
│   ├── validator/        structural + style-key validation
│   └── test-utils/       shared graph fixtures
├── fixtures/examples/    .arrows files shipped with the extension as bundled examples
├── CLAUDE.md             coding rules + architecture invariants for future contributors
└── SPEC.md               canonical spec for what we're building and the DONE gates
```

## Decoupling rules (enforced)

Code under `arrows-code/` may import only from:
- `@neo4j-arrows/{model,graphics,selectors}` — additive exports only
- npm packages declared in each project's `package.json`

Forbidden: anything under `apps/arrows-ts/**`. Caught by Nx project tags + ESLint `@nx/enforce-module-boundaries`.

## Commands

```bash
# Test a single project (TDD inner loop)
npx nx test arrows-code-validator --watch

# Test everything in this subsystem
npx nx run-many -t test --projects=arrows-code-*

# Build the VS Code extension (.vsix)
cd arrows-code/apps/vscode-arrows && npm run package

# Build + install locally + reminder to reload window
cd arrows-code/apps/vscode-arrows && npm run install:local

# Build the MCP server
cd arrows-code/apps/mcp-arrows && npx nx build arrows-code-mcp-arrows

# Pre-commit gate
npx nx affected -t lint,typecheck,test
```

## Architecture invariants

These keep the round-trip stable. See `CLAUDE.md` for the full list.

- **Graph state is immutable.** Reducers and patch ops return new objects; never mutate in place.
- **Bridge state machine.** Outbound emits (`shouldEmit`) and inbound load deferral consult the same `isUserBusy` predicate. Adding a new busy condition to one side without the other races.
- **Single race flag** in `PreviewProvider` (`applyChain` Promise). Don't reintroduce a `docVersion` guard — it was the source of the "rapid-edit reversal" bug class.
- **Canonical comparison** for echo suppression strips `entityType` (reducers omit it, `readGraph` adds it). Don't compare raw `JSON.stringify`.

## Testing

- **Unit + integration** — colocated `*.spec.ts(x)` next to source. Vitest. 200+ tests covering bridge sync, pan / zoom decisions, validator rules, Cypher escape, format-json round-trip.
- **Real VS Code Electron integration** — `apps/vscode-arrows/scripts/commands-test.mjs` boots a real Electron host via `@vscode/test-electron` and exercises every command handler.
- **Playwright** — embed canvas behavior + visual regression placeholders for features still in progress.
- **Torture suite** — `bridge.spec.ts` threads ~50 interleaved drag / edit / load operations through a single bridge instance to catch ping-pong / clobber / lost emits.

## Status

The extension and MCP server are feature-complete for the v0 surface. See each app's CHANGELOG for what's in / out / known-limitations.

## License

Apache-2.0, matching the parent repo.
