# Decoupling memo — Phase 0 audit findings

> Read-only trace of arrows.app's rendering and storage code to determine how `arrows-code` integrates without touching the existing app.

## Outcome

**Best-case contingency** (per `SPEC.md` Renderer reality check). The SVG render path already exists, is largely portable, and is not coupled to the React tree. One additive line in `libs/graphics/src/index.ts` decouples it. No web-app behavior change.

## Key findings

### SVG rendering already exists

`libs/graphics/src/lib/utils/offScreenSvgRenderer.ts` exports two functions:

- `renderSvgDom(graph: Graph, cachedImages): SVGElement` — pure, in-memory render. Returns a DOM `SVGElement`.
- `renderSvgEncapsulated(graph, cachedImages): Promise<{width, height, dataUrl}>` — same plus inlined Google font CSS, returned as a base64 data URL.

Both accept `Graph` directly (no Redux). The only "selection" parameter is hard-coded empty in the offscreen path. `cachedImages` can be `{}` if the graph has no images.

To get an SVG string from `renderSvgDom`:

```ts
const svgString = new XMLSerializer().serializeToString(renderSvgDom(graph, {}))
```

### Coupling points (manageable)

The renderer pulls in browser globals:

| Global | Used by | Mitigation for Node (MCP server) |
|---|---|---|
| `document.createElementNS` | `SvgAdaptor` constructor + `newElement` helper | `jsdom` provides this |
| `XMLSerializer` | serializing the result | `jsdom` provides this |
| `window.document.createElement('canvas')` + `getContext('2d').measureText` | `SvgAdaptor` text measurement | `jsdom` doesn't provide a real canvas; use `canvas` (node-canvas) **or** a shim that returns approximate `measureText` widths from font metrics |

In the VS Code webview, all three globals are real — zero polyfill needed.

In Node-only contexts (MCP server) we'll wrap the renderer in a thin adapter that installs `jsdom` + a `measureText` shim, both behind a one-time `setupHeadlessSvgEnv()` call. This belongs in `arrows-code/libs/renderer-host/`, not in `libs/graphics`. The graphics lib stays DOM-only.

### Public-API gap

`libs/graphics/src/index.ts` currently exports only `Visual*` classes:

```ts
export * from './lib/VisualGraph';
export * from './lib/VisualNode';
export * from './lib/VisualRelationship';
export * from './lib/VisualAttachment';
export * from './lib/VisualGang';
export * from './lib/VisualGuides';
```

It does **not** re-export `offScreenSvgRenderer`. So `@neo4j-arrows/graphics` consumers cannot reach `renderSvgDom` today.

**Proposed additive change (one PR, no behavior delta):**

```ts
// libs/graphics/src/index.ts
export * from './lib/VisualGraph';
export * from './lib/VisualNode';
export * from './lib/VisualRelationship';
export * from './lib/VisualAttachment';
export * from './lib/VisualGang';
export * from './lib/VisualGuides';

// Headless SVG rendering — used by arrows-code subsystem.
export { renderSvgDom, renderSvgEncapsulated } from './lib/utils/offScreenSvgRenderer';
```

Verified safe: the web app imports `offScreenSvgRenderer` directly via the relative path inside `apps/arrows-ts/src/components/SvgExport.jsx`, not through the package alias. Adding the re-export doesn't affect it.

### Other reusable storage / format code

| Module | Reusable? | Action |
|---|---|---|
| `apps/arrows-ts/src/storage/exportCypher.js` (+ `.test.js`) | Yes, pure | Phase 2 relocate to `libs/format-cypher/`. Until then `arrows-code` does not depend on it. |
| `apps/arrows-ts/src/storage/googleDriveStorage.js#constructGraphFromFile` | Yes, pure JSON → Graph | Reimplement in `libs/format-json` from scratch (Vitest TDD), then verify byte-equivalence against this oracle. Avoids touching the web app on day one. |
| `apps/arrows-ts/src/graphql/exportGraphQL.js` | Yes, pure | Phase 2 relocate. |
| Redux actions, reducers, interactions, UI components | No | Out of scope. |

### Existing test oracles to lean on

| Oracle | Used by `arrows-code` |
|---|---|
| `libs/model/src/lib/Id.test.ts` | `libs/patch` id-generation tests |
| `libs/model/src/lib/labels.test.js` | `libs/validator` naming rule tests |
| `libs/model/src/lib/properties.test.js` | `libs/format-json` property semantics |
| `libs/model/src/lib/values.test.js` | `libs/validator` parameters rule |
| `apps/arrows-ts/src/storage/exportCypher.test.js` | Future `libs/format-cypher` tests |
| `apps/arrows-ts/src/graphics/bisect.test.js` | `libs/layout` geometry |
| `libs/graphics/src/lib/utils/circleWordWrap.test.ts` | Same |

When a new rule overlaps an existing test, import the same fixtures rather than invent new ones.

## What this means for the schedule

The full bidirectional VS Code extension stays in v1. No fallback to read-only-first needed.

The only Phase 0 deliverable that touches code outside `arrows-code/` is a one-line addition to `libs/graphics/src/index.ts`. That PR is separable and reviewable on its own.

## Open follow-up

- `measureText` shim in Node: decide between `node-canvas` (heavy, native deps) and a font-metric estimator (lightweight, slight rendering drift). Decision belongs in `libs/renderer-host` design, not here.
- Confirm whether `assembleGoogleFontFacesCssWithEmbeddedFontData` is essential for parity SVG output or only for the encapsulated-font data-URL path. If essential, font fetching needs an offline cache for hermetic CI. v1 uses `renderSvgDom` (no embedded fonts) to side-step this.
