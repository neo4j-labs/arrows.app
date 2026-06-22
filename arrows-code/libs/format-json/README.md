# @arrows-code/format-json

Read and write the canonical `.arrows` JSON format.

## API

```ts
import { readGraph, writeGraph, canonicalize } from '@arrows-code/format-json';

const { graph, diagnostics } = readGraph(text);
const text = writeGraph(graph);
const normalized = canonicalize(graph);
```

## Guarantees

- `readGraph(writeGraph(g)) ≡ g` for every fixture (structural equality after canonicalize).
- `writeGraph(g)` is byte-identical across 100 consecutive calls.
- Tolerates CRLF input (Windows-saved files), trailing newlines, non-BMP unicode captions.
- Orphan relationships are dropped with a warning rather than crashing.
- `entityType` is stripped on write and reconstructed on read.

## Tests

35+ tests in `src/lib/*.spec.ts` covering shape, stability, round-trip, edge cases.
