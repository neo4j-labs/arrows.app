# How to test arrows-code

Three layers, run in order from fastest to slowest.

## 1. Unit tests (vitest, <5s)

```bash
# Library
npx nx test arrows-code-format-json

# Extension src
cd arrows-code/apps/vscode-arrows && npm test
```

Covers: graph read/write round-trips, layout algorithms, patch ops, structural validation, webview request/response envelope, command catalog, Cypher clause picker, import-URL parser.

## 2. Electron smoke test (~10s)

Boots a real VS Code Electron host and asserts the extension activates and every contributed command resolves.

```bash
cd arrows-code/apps/vscode-arrows && npm run commands-test
```

Run this before packaging - it catches activation-event regressions that unit tests can't see.

## 3. End-to-end (Playwright, ~30s)

Drives the embed bundle in a real browser against the arrows-ts dev server (port 4200). Asserts the postMessage protocol over canvas interactions.

```bash
cd arrows-code/apps/vscode-arrows && npm run e2e
```

## 4. Manual sanity check inside VS Code

```bash
cd arrows-code/apps/vscode-arrows && npm run install:local
```

Then in VS Code: `Cmd+Shift+P → Developer: Reload Window`.

If a previously-installed version is still active after a reload, the extension host is caching: close **all** VS Code windows and reopen. The `install:local` script prints this reminder on success.

Open `arrows-code/fixtures/examples/social.arrows` (or use the sidebar's "New from example…") and verify: canvas renders, drag a node, edit JSON in a side panel - both directions should round-trip without jitter.

## Pre-package gate

`npm run package` runs `build → test → commands-test → vsce package` in sequence. If any step fails the `.vsix` is not produced.
