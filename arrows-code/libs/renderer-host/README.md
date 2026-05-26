# @arrows-code/renderer-host

Render an arrows.app graph to SVG anywhere — Node, Electron, browser. Wraps `@neo4j-arrows/graphics`'s `renderSvgDom` with a headless DOM polyfill so server-side SVG uses the same primitives that draw the web canvas.

## API

```ts
import { renderGraphToSvg } from '@arrows-code/renderer-host';

const { svg, width, height, nodes } = await renderGraphToSvg(graph);
// svg:    SVG string with xmlns set
// width:  natural width in SVG units
// height: natural height
// nodes:  per-node SVG-space centers (useful for overlay hit-testing)
```

## How it works

Browser: shim is a no-op. Node/Electron without `canvas` npm package: lazy-loads `jsdom`, polyfills `HTMLCanvasElement.getContext` with a `measureText`-only context driven by a per-character width table calibrated to Helvetica. Idempotent — safe to call repeatedly.

## Tests

10 tests in `src/lib/renderSvg.spec.ts` covering empty graph, single isolated node, self-loop, unicode caption, repeated renders.
