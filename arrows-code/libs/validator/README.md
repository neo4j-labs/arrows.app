# @arrows-code/validator

Structural validation for arrows.app graphs.

## API

```ts
import { validate } from '@arrows-code/validator';
const diagnostics = validate(graph);
// → Array<{ severity: 'error' | 'warning' | 'info', code: string, message: string, anchor?: {...} }>
```

## Rules

| Code | Severity | Catches |
|---|---|---|
| `structural.duplicate-id` | error | Two nodes/relationships share an id |
| `structural.ref-integrity` | error | Relationship endpoint refers to a missing node |
| `structural.empty-required` | error | Missing id / position / rel type |
| `structural.style-key-unknown` | warning | Unknown style key (validated against `styleAttributes` in `@neo4j-arrows/model` — never drifts) |

Self-loops and multi-edges produce zero diagnostics (legitimate modelling).

## Tests

13 tests in `src/lib/structural.spec.ts`.
