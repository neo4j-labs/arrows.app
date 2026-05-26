# @arrows-code/format-cypher

Generate Cypher `CREATE` / `MERGE` / `MATCH` from an arrows.app graph. Relocated from `apps/arrows-ts/src/storage/exportCypher.js`; behavior matches the web app, plus injection hardening.

## API

```ts
import { exportCypher } from '@arrows-code/format-cypher';
const cypher = exportCypher(graph, 'CREATE', { includeStyling: false });
```

## Injection hardening

- Backticks inside identifiers (label, property key) are doubled per Cypher escape rules.
- Double quotes inside values are backslash-escaped; pre-existing backslashes are escaped first so existing escapes survive.

See `src/lib/injection.spec.js` for the regression suite.

## Topology edges covered

Bare node → `CREATE ()`. Disconnected components → comma-joined. Self-loop → identifier on both ends. Property key with space → backticked. Multi-edges → distinct clauses.

## Tests

14 tests in `src/lib/*.spec.{js,ts}`.
