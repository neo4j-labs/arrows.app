# @arrows-code/patch

Typed graph operations as a tagged union plus a pure `apply()` that returns a new graph.

## API

```ts
import { apply } from '@arrows-code/patch';
import type { PatchOp } from '@arrows-code/patch';

const { graph, errors } = apply(start, [
  { type: 'addNode', id: 'n0', x: 0, y: 0, caption: 'Alice', labels: ['Person'] },
  { type: 'addRelationship', id: 'r0', fromId: 'n0', toId: 'n1', relType: 'KNOWS' },
  { type: 'setProperty', id: 'n0', key: 'age', value: '30' },
]);
```

## Operation types

`addNode`, `removeNode`, `movePos`, `setPos`, `setCaption`, `addLabel`, `removeLabel`, `renameLabel`, `setProperty`, `removeProperty`, `setStyle`, `addRelationship`, `removeRelationship`, `setRelType`, `renameRelType`.

## Properties

- **Immutable** — `apply` never mutates its input.
- **Composable** — `apply(g, [a, b, c])` ≡ `apply(apply(apply(g, a), b), c)`.
- **Validating** — invalid ops (e.g. `addRelationship` with missing endpoint) return `errors[]` instead of corrupting the graph.

## Tests

20 tests in `src/lib/apply.spec.ts` covering every op + composition + self-loops.
