# arrows-code

Subsystem brings arrows.app into VS Code. Self-contained under `arrows-code/`; deletable without breaking the host monorepo.

## Layout

```
arrows-code/
├── apps/
│   └── vscode-arrows/   VS Code extension (CustomTextEditorProvider + commands + sidebar)
├── libs/
│   ├── format-json/     read/write canonical .arrows JSON
│   ├── patch/           PatchOp types + apply()
│   ├── validator/       structural validation
└── fixtures/examples/   bundled .arrows examples shown in sidebar
```

Only allowed imports from the host repo: `@neo4j-arrows/{model,graphics,selectors}`. Never `apps/arrows-ts/**`.

## Commands

```bash
npx nx test arrows-code-validator               # one project
npx nx run-many -t test --projects=arrows-code-* # all
cd arrows-code/apps/vscode-arrows && npm run install:local  # build + install (then Reload Window in VS Code)
cd arrows-code/apps/vscode-arrows && npm run build        # build only (no install)
cd arrows-code/apps/vscode-arrows && npm run commands-test  # real VS Code Electron host
cd arrows-code/apps/vscode-arrows && npm run package      # build .vsix
```

## Comment policy

Default: write no comment.

Add one only when the *why* isn't visible in the code:

- A platform quirk (`acquireVsCodeApi` is one-shot; jsdom `getContext` throws when canvas npm pkg is absent)
- A historical bug the code now guards against (echo ping-pong, mid-drag clobber)
- A non-obvious invariant a future reader would otherwise break
- A reference to an external contract that constrains the code (Cypher escape rules, VS Code message protocol)

Never write:

- File header doc-blocks describing what the file does (the export names already do)
- Comments restating the next line (`// increment counter` above `counter++`)
- Multi-paragraph comments. One sentence max.
- Comments narrating sections of a function (`// 1. Parse`, `// 2. Validate`). Extract a function if you need a heading.
- TODO/FIXME without an issue link. Move to GitHub issues.
- Justification that belongs in the commit message ("fix for bug #123", "added for the X flow").
- `@param`/`@returns` JSDoc on TypeScript code — types already document those.

When trimming an existing comment, ask: would removing it confuse a competent reader? If no, remove.

## Shared canvas — one codebase, two surfaces

The VS Code extension does **not** have its own copy of the graph canvas, renderer, or inspector. It embeds the arrows-ts app as a Vite bundle.

- All canvas logic lives in `apps/arrows-ts/src/` (shared with the web app).
- The embed-specific files are only in `apps/arrows-ts/src/embed/`: the postMessage bridge (`bridge.ts`), the entry point (`main.tsx`), and the thin toolbar overlay (`EmbedToolbar.tsx`, `EmbedActionMenu.tsx`, `EmbedFooter.tsx`).
- **To change any canvas behaviour**, edit `apps/arrows-ts/src/` as you would for the web app, then rebuild: `cd arrows-code/apps/vscode-arrows && npm run build`.

Never duplicate canvas or renderer code into `arrows-code/`. If something only works in one surface, the split belongs in `embed/`.

## Architecture invariants

- **Graph is immutable.** Reducers and patch ops return new objects; never mutate in place.
- **Bridge state machine.** Outbound (shouldEmit) and inbound (applyHostLoad deferral) consult the same `isUserBusy` predicate. Don't add a new busy-condition to one side without the other.
- **Single race flag in PreviewProvider.** `roundTripState: 'idle' | 'applying'`. Don't split it back into two.
- **Document-version guard.** Every webview→host edit checks `originatingDocVersion` against current. Stale edits drop.

## Test conventions

Co-located `*.spec.ts(x)` next to source. Vitest.

`commands-test.mjs` boots a real VS Code Electron host via `@vscode/test-electron`. Run before packaging.

The bridge has a torture spec (`apps/arrows-ts/src/embed/bridge.spec.ts`) that hammers interleaved drag/edit/load operations through a fake store. Add new bridge scenarios there, not new ad-hoc tests.
