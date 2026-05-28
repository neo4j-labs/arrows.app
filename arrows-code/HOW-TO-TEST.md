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

- restart vs code or reload (reload doesnt always work for all functionality).
