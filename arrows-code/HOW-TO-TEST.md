# How to test arrows-code

All commands run from the repo root.

## 1. Run the test suite

```bash
npx nx run-many -t test --projects=arrows-code-*
```

## 2. Test the VS Code extension

```bash
cd arrows-code/apps/vscode-arrows && npm run install:local
```

Then in VS Code (`Cmd+Shift+P → Developer: Reload Window`):

1. Open `arrows-code/fixtures/examples/social.arrows` — preview renders.
2. Edit a node caption in the JSON — preview updates within one frame.
3. Right-click → "Save as SVG…" to export.
4. `Cmd+Shift+P → Arrows: Auto-arrange nodes` to run a layout.

To rebuild the `.vsix` after changes:

```bash
cd arrows-code/apps/vscode-arrows && npm run package
```

## 3. Confirm decoupling

```bash
git rm -rf arrows-code   # on a throwaway branch
npx nx test arrows-ts    # web app still passes
```
