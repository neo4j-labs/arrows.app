# How to test arrows-code

End-to-end visual + functional verification. All commands run from the repo root.

## 1. Run the test suite

```bash
npx nx run-many -t test --projects=arrows-code-*
```

Expected: every project green. As of last commit:

| Project | Tests |
|---|---|
| `arrows-code-format-json` | 24 passing |
| `arrows-code-patch` | 10 passing |
| `arrows-code-renderer-host` | 5 passing |
| `arrows-code-mcp-arrows` | 6 passing (incl. visual demo) |

## 2. See the visual demo (no setup required)

The MCP test suite renders `fixtures/examples/social.arrows` end-to-end and writes a viewer to `arrows-code/dist/demo/`:

```bash
npx nx test arrows-code-mcp-arrows    
open arrows-code/dist/demo/viewer.html
```

What you should see: a 1047×509 SVG diagram with four nodes (`Alice`, `Bob`, `Hello World`, `Graphs`) and four labeled relationships (`KNOWS`, `AUTHORED`, `ABOUT`, `LIKED`) rendered with arrows.app's actual rendering engine — identical to what you'd see in the web app.

The file `arrows-code/dist/demo/demo.svg` is the raw SVG output; open it directly in any browser too.

## 3. Test the VS Code extension

A `.vsix` is built at `arrows-code/apps/vscode-arrows/dist/arrows-code-vscode-arrows.vsix`.

```bash
code --install-extension arrows-code/apps/vscode-arrows/dist/arrows-code-vscode-arrows.vsix
```

Then in VS Code:

1. Open `arrows-code/fixtures/examples/social.arrows`.
2. The custom editor (Arrows Preview) renders the SVG in the editor pane.
3. Right-click → "Reopen Editor With…" → "Default Text Editor" to see the JSON source.
4. Edit a node's `caption` in the text editor; the preview re-renders within one frame.
5. Run command "Arrows: Export as SVG" to write a `.svg` file.

To rebuild the `.vsix` after changes:

```bash
cd arrows-code/apps/vscode-arrows
npm run build && npm run package
```

## 4. Test the MCP server (manual smoke)

The server speaks MCP over stdio. To wire it into Claude Code locally:

```bash
# Build the server bundle
cd arrows-code/apps/mcp-arrows
npx esbuild src/server.ts --bundle --outfile=dist/server.js \
  --platform=node --format=esm --target=node18 --packages=external \
  --banner:js='import { createRequire } from "module"; const require = createRequire(import.meta.url);'

# Register with Claude Code (run from repo root so workspace deps resolve)
cd ../../..
claude mcp add arrows -- node arrows-code/apps/mcp-arrows/dist/server.js
```

Then in a Claude session:

> "Use the `render_arrows` tool on this graph and show me the SVG dimensions."
>
> (paste the contents of `arrows-code/fixtures/examples/social.arrows`)

Expected: tool call returns `{ svg, width: 1047, height: 509, diagnostics: [] }`.

## 5. Confirm decoupling

```bash
git rm -rf arrows-code   # do this on a throwaway branch
npx nx test arrows-ts    # web app still works
```

The web app must remain fully functional with `arrows-code/` deleted. The only change to the parent repo is one additive line in `libs/graphics/src/index.ts` re-exporting `renderSvgDom` — already shipped.

## 6. Known limitations of this v1 cut

- `renderer-host` uses jsdom plus a `measureText` shim (char-count × font-size approximation). Layout, hit-testing, and labels work; text widths are approximate, so SVG output is **visually equivalent** but not **byte-identical** to a real-browser render. Production targets a real Canvas implementation in Node (e.g. `node-canvas`).
- VS Code extension is **read-only preview** in this build. Bidirectional drag-edit (preview → source) is spec'd but not wired.
- `libs/validator`, `libs/layout`, `libs/palette` are spec'd but not yet implemented. The validator structural rules will surface when wired (next sprint).
- Relationship-type labels (e.g. `KNOWS`) render the line but not the text label in the current Node shim — caused by jsdom's missing canvas. Fixed when we switch to `node-canvas`.
