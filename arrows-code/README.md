# arrows-code

VS Code extension that brings arrows.app into the developer's text editor.

Self-contained subsystem inside the `arrows.app` monorepo. Deleting `arrows-code/` removes it cleanly — the parent web app is untouched.

## Layout

```
arrows-code/
├── apps/
│   └── vscode-arrows/    VS Code extension (CustomTextEditorProvider + commands + sidebar)
├── libs/
│   ├── format-json/      read/write canonical .arrows JSON, deterministic output
│   ├── format-cypher/    Cypher CREATE/MERGE export with injection-hardened escapes
│   ├── layout/           5 layout algorithms (force / hierarchical / radial / circular / grid)
│   ├── patch/            PatchOp types + pure apply()
│   ├── validator/        structural + style-key validation
│   └── test-utils/       shared graph fixtures
├── fixtures/examples/    .arrows files shipped with the extension as bundled examples
└── CLAUDE.md             coding rules + architecture invariants for future contributors
```

## Decoupling rules

Code under `arrows-code/` may import only from:
- `@neo4j-arrows/{model,graphics,selectors}` — additive exports only
- npm packages declared in each project's `package.json`

Forbidden: anything under `apps/arrows-ts/**`. Caught by Nx project tags + ESLint `@nx/enforce-module-boundaries`.

## Commands

```bash
# Test everything in this subsystem
npx nx run-many -t test --projects=arrows-code-*

# Build the VS Code extension (.vsix)
cd arrows-code/apps/vscode-arrows && npm run package

# Build + install locally (then Cmd+Shift+P → Developer: Reload Window)
cd arrows-code/apps/vscode-arrows && npm run install:local

# Pre-commit gate
npx nx affected -t lint,typecheck,test
```

## Architecture invariants

- **Graph state is immutable.** Patch ops return new objects; never mutate in place.
- **Bridge state machine.** Outbound emits and inbound load deferral consult the same `isUserBusy` predicate.
- **Single race flag** in `PreviewProvider` (`applyChain` Promise).
- **Canonical comparison** for echo suppression strips `entityType`.

## License

Apache-2.0, matching the parent repo.
