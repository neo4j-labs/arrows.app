# @arrows-code/layout

Five layout algorithms for arrows.app graphs. Pure functions that take a graph and return it with new positions; everything else (caption, labels, properties, style) is preserved.

## API

```ts
import { LAYOUTS, findLayout } from '@arrows-code/layout';

const force = findLayout('force');
const laidOut = await force.run(graph);
```

## Algorithms

| Id | Best for |
|---|---|
| `force` | Default. Organic spring layout for social / dense / no-hierarchy graphs |
| `hierarchical` | Top-down tiers — DAGs, dependency graphs, RBAC ladders |
| `radial` | Hub-and-spoke — one central node with rings outward |
| `circular` | Single ring of peers — round-robin, fully-connected sets |
| `grid` | Catalog / disconnected nodes — visual reset when topology doesn't drive layout |

Force-directed and radial both label-aware: per-node effective radius (body + caption + property lines) drives collision and ring-radius math, so dense graphs don't overlap captions.

## Determinism

Every layout sorts inputs by `id` before running and uses no randomness. Same input → same output bytes, every time.
