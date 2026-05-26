# @arrows-code/test-utils

Shared graph fixtures for tests across `arrows-code/libs` and `arrows-code/apps`. Don't inline structurally-equivalent graphs across spec files — import from here so the fixtures stay byte-aligned.

## Exports

```ts
import { emptyGraph, makeNode, makeRel, aliceBobGraph } from '@arrows-code/test-utils';

const g = emptyGraph();
const alice = makeNode('n0', { caption: 'Alice', labels: ['Person'] });
const rel = makeRel('r0', 'n0', 'n1', 'KNOWS');
const fixture = aliceBobGraph(); // two-Person KNOWS graph used everywhere
```

## Conventions

- Positions default to `Point(0, 0)`; pass `position` to override.
- `entityType` is set so the fixture round-trips through `writeGraph` / `readGraph` unchanged.
- `aliceBobGraph()` returns a fresh object every call — safe to mutate in tests.
