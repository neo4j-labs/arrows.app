# Spec: arrows-code — VS Code renderer, MCP server, semantic validator

> A decoupled subsystem inside `arrows.app` that brings arrows into VS Code and exposes it to AI agents via MCP, reusing arrows' rendering engine but living in its own top-level directory so it can be lifted out to a separate repo with no surgery.

## Assumptions (correct now or the spec proceeds with these)

1. Canonical on-disk format = arrows native JSON (`{nodes, relationships, style}`). YAML projection is a separate human-readable view, not a parallel source of truth.
2. No new "language" / DSL. The text the user edits is structured JSON or YAML.
3. Rendering inside VS Code reuses arrows' actual rendering code via published-library boundaries. We do not re-implement nodes, relationships, styling, or geometry.
4. `arrows.app`'s `libs/` change only by **additive** exposure (e.g. exporting an existing SVG function). No behavior change to the web app.
5. Validator targets Neo4j property-graph modelling; it does not validate Cypher itself.
6. v1 ships full bidirectional editing in VS Code. No preview-only milestone.
7. MCP server is published as `@neo4j-labs/mcp-arrows` on npm. VS Code extension is published to the VS Code Marketplace. Both release pipelines independent.
8. Default test framework = Vitest (matches existing `apps/arrows-ts`).
9. Authoring inside `arrows.app` monorepo for now; structured for future repo split.
10. License: Apache-2.0, matching the parent repo.

## Objective

Bring arrows.app's modelling capability into the developer's text editor so Neo4j data models live as version-controlled artifacts next to the code that consumes them — and expose the same engine to AI agents (Claude, Copilot, etc.) via MCP so they can author, refactor, and validate property-graph models at intent level, not text level.

**Who it's for:**
- Developers building Neo4j-backed apps who currently keep their model in a screenshot or a stale Confluence doc.
- AI coding agents that today produce broken Cypher because they hallucinate the underlying schema.
- Solutions architects and data modellers who already use arrows.app but want PR-reviewable diffs.

**Definition of success (overall — see per-component DONE below for granular gates):**
- Round-trip with arrows.app: any `.arrows` file produced by VS Code renders byte-identical in the web app, and vice versa.
- A cold Claude session with only `@neo4j-labs/mcp-arrows` configured can produce a non-trivial valid graph (10+ nodes, 3+ labels, sensible layout, palette, naming) from a prose description, in one turn, with zero validator warnings after `auto_fix`.
- VS Code extension passes manual gauntlet (listed under "DONE" below).
- New code lives entirely under `arrows-code/`; deleting that directory removes the new subsystem without breaking the existing web app.

## Decoupling constraint (high-priority requirement)

**All new code lives under a single top-level directory: `arrows-code/`.**

```
arrows.app/                     (existing repo root)
├── apps/                       (existing — untouched except additive exports)
├── libs/                       (existing — additive only)
├── tools/                      (existing)
├── arrows-code/                NEW — self-contained subsystem
│   ├── libs/
│   │   ├── format-json/        read/write canonical JSON
│   │   ├── format-yaml/        round-trippable YAML projection
│   │   ├── validator/          7-layer semantic validator
│   │   ├── patch/              PatchOp types + applier
│   │   ├── layout/             force / hierarchical / grid / radial
│   │   ├── palette/            color theme generator + WCAG contrast
│   │   └── renderer-host/      thin wrapper around libs/graphics for SVG + interactive embed
│   ├── apps/
│   │   ├── vscode-arrows/      VS Code extension
│   │   └── mcp-arrows/         MCP server (Node, MCP TS SDK)
│   ├── fixtures/               example .arrows / .arrows.yaml graphs (also served as MCP resources)
│   ├── docs/                   architecture notes, validator rule catalog
│   ├── SPEC.md                 this file
│   ├── package.json            optional sub-workspace marker
│   └── README.md
```

**Allowed coupling to the existing arrows code:** import from `@neo4j-arrows/model`, `@neo4j-arrows/graphics`, `@neo4j-arrows/selectors`. Nothing else. No imports from `apps/arrows-ts/**`. If we need behaviour that currently lives in `apps/arrows-ts/src/storage/exportCypher.js` or `googleDriveStorage.js`, **the existing file is relocated to `libs/`** (additive change to the web app: just an import-path update), not copied into `arrows-code/`.

**Enforcement:**
- Nx project boundaries via `tags` + `@nx/enforce-module-boundaries` ESLint rule.
- A CI check greps `arrows-code/**/*.{ts,tsx}` for forbidden import patterns (`../../apps/`, `apps/arrows-ts/`).

**Why this matters:** when the extension community grows and a split is wanted, the move is `git mv arrows-code/ ../arrows-vscode/` plus changing four import aliases to npm package names. No code archaeology.

## Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Language | TypeScript 5.0 | matches existing repo |
| Test framework | Vitest | matches existing repo; jsdom env for renderer/host tests |
| Renderer base | `libs/graphics` (existing) | additive `renderGraphToSvg` export |
| VS Code API | `vscode` 1.85+ | `CustomTextEditorProvider`, webview, language config |
| MCP SDK | `@modelcontextprotocol/sdk` (TS) | stdio transport for `claude mcp add`; HTTP optional |
| YAML | `yaml` (Eemeli's, comment-preserving `Document` API) | not `js-yaml` (drops comments) |
| Color | `culori` | parsing + WCAG contrast |
| Layout | `d3-force` (force), bespoke for hierarchical/grid/radial | no heavy graph-layout dep |
| Build | Nx 16 (existing) + Vite for webview | extension built with `vsce package` |
| Lint | ESLint with `@nx/enforce-module-boundaries` | hard gate on coupling |

## Commands

All commands run from repo root. Each `arrows-code/` project is an Nx project, so the standard Nx targets apply.

```bash
# Build
npx nx run-many -t build --projects=arrows-code-*

# Test (TDD inner loop)
npx nx test arrows-code-validator --watch
npx nx test arrows-code-validator -- -t "placement.overlap"   # single test by name
npx nx test arrows-code-validator -- src/lib/placement.spec.ts # single file

# Lint
npx nx run-many -t lint --projects=arrows-code-*

# Type check
npx nx run-many -t typecheck --projects=arrows-code-*

# VS Code extension dev
npx nx serve arrows-code-vscode-arrows          # launches Extension Development Host

# VS Code extension package (.vsix)
npx nx run arrows-code-vscode-arrows:package

# MCP server local run (stdio, for `claude mcp add`)
npx nx run arrows-code-mcp-arrows:start

# Full pre-commit gate
npx nx affected -t lint,typecheck,test
```

## Project structure (detailed)

```
arrows-code/
├── libs/
│   ├── format-json/
│   │   ├── src/lib/
│   │   │   ├── read.ts                # JSON string → Graph
│   │   │   ├── write.ts               # Graph → JSON string (stable key order)
│   │   │   ├── canonicalize.ts        # idempotent normalization
│   │   │   └── *.spec.ts
│   │   └── project.json
│   ├── format-yaml/
│   │   ├── src/lib/
│   │   │   ├── read.ts                # YAML → Graph (preserves comments via Document)
│   │   │   ├── write.ts               # Graph → YAML (preserves user comments on round-trip)
│   │   │   ├── projection.ts          # mapping rules JSON ↔ YAML
│   │   │   └── *.spec.ts
│   ├── validator/
│   │   ├── src/lib/
│   │   │   ├── rules.ts               # registry, codes, default severities
│   │   │   ├── structural.ts          # ref integrity, dup ids, orphan styles
│   │   │   ├── naming.ts              # Label PascalCase, REL_TYPE SCREAMING, etc.
│   │   │   ├── propertyTypes.ts       # same-label same-key type consistency
│   │   │   ├── placement.ts           # overlap, off-canvas, edge crossings, clustering
│   │   │   ├── color.ts               # parse, contrast, palette discipline
│   │   │   ├── parameters.ts          # $param refs, unused bindings, type consistency
│   │   │   ├── cypherSanity.ts        # exportCypher would produce valid Cypher
│   │   │   ├── fixes.ts               # PatchOp[] proposals per diagnostic
│   │   │   └── *.spec.ts
│   ├── patch/
│   │   ├── src/lib/{types,apply,validate}.ts + specs
│   ├── layout/
│   │   ├── src/lib/{force,hierarchical,grid,radial}.ts + specs
│   ├── palette/
│   │   ├── src/lib/{generate,apply,contrast,themes}.ts + specs
│   └── renderer-host/
│       ├── src/lib/
│       │   ├── headlessSvg.ts         # wraps libs/graphics' SVG export for Node + webview
│       │   ├── interactiveHost.tsx    # mounts the canvas + interaction handlers in webview
│       │   └── *.spec.ts
│
├── apps/
│   ├── vscode-arrows/
│   │   ├── src/
│   │   │   ├── extension.ts           # activation, command registration
│   │   │   ├── PreviewProvider.ts     # CustomTextEditorProvider
│   │   │   ├── sync/
│   │   │   │   ├── toPreview.ts       # text change → postMessage
│   │   │   │   └── fromPreview.ts     # webview message → WorkspaceEdit via patch ops
│   │   │   ├── lsp/
│   │   │   │   └── diagnostics.ts     # bridge validator → vscode.Diagnostic
│   │   │   └── *.spec.ts
│   │   ├── media/
│   │   │   ├── index.html
│   │   │   └── webview.bundle.js      # built from renderer-host/interactiveHost
│   │   ├── package.json               # `contributes`, `engines.vscode`, `categories`
│   │   └── project.json
│   └── mcp-arrows/
│       ├── src/
│       │   ├── server.ts              # MCP server bootstrap, stdio transport
│       │   ├── tools/
│       │   │   ├── render.ts          # render_arrows
│       │   │   ├── validate.ts        # validate_arrows
│       │   │   ├── lint.ts            # lint_arrows
│       │   │   ├── describeSchema.ts  # describe_schema
│       │   │   ├── applyPatch.ts      # apply_patch
│       │   │   ├── suggestLayout.ts   # suggest_layout
│       │   │   ├── suggestPalette.ts  # suggest_palette
│       │   │   ├── autoFix.ts         # auto_fix
│       │   │   ├── diff.ts            # diff_graphs
│       │   │   ├── explain.ts         # explain_graph
│       │   │   ├── exportCypher.ts    # export_cypher
│       │   │   └── exportGraphql.ts   # export_graphql
│       │   ├── resources/
│       │   │   ├── modelTypes.ts      # arrows://spec/model-types
│       │   │   ├── styleSchema.ts     # arrows://spec/style-schema (generated from styling.ts)
│       │   │   ├── yamlProjection.ts  # arrows://spec/yaml-projection
│       │   │   ├── validatorRules.ts  # arrows://spec/validator-rules (generated)
│       │   │   ├── conventions.ts     # arrows://conventions/neo4j
│       │   │   └── examples.ts        # arrows://examples/*
│       │   ├── prompts/
│       │   │   ├── fromDescription.ts
│       │   │   ├── refactor.ts
│       │   │   ├── review.ts
│       │   │   ├── fromCypherQuery.ts
│       │   │   └── harmonize.ts
│       │   └── *.spec.ts
│       ├── bin/mcp-arrows.js          # npx entrypoint
│       └── project.json
│
├── fixtures/
│   ├── round-trip/                    # known-good graphs for every format/render parity test
│   ├── validator/
│   │   ├── pass/                      # graphs that should produce zero warnings
│   │   └── fail/<code>/               # graphs that must trigger exactly the named diagnostic
│   ├── examples/                      # social, retail, fraud, iam, knowledge-graph, supply-chain, event-sourcing
│   └── llm-smoke/                     # prompt + expected schema shape
│
├── docs/
│   ├── architecture.md
│   ├── validator-rules.md             # generated reference
│   ├── yaml-projection.md
│   ├── mcp-tools.md
│   └── decoupling.md                  # what stays out of arrows.app proper
│
├── SPEC.md                            # this document, committed in-repo
├── README.md
└── package.json                       # optional sub-workspace marker
```

**Outside `arrows-code/` — minimum touch list (all additive):**
- `libs/graphics/` — export `renderGraphToSvg(graph): string` decoupled from React tree.
- `apps/arrows-ts/src/storage/exportCypher.js` and `googleDriveStorage.js` — relocated to `libs/format-cypher/` and `libs/format-json-core/` respectively, with a one-line re-export from the original paths so the web app keeps working. **No logic changes.**
- `libs/model/`, `libs/selectors/` — possibly add `package.json` to make them publishable as `@neo4j-arrows/*`. No code changes.

## Code style

One snippet beats three paragraphs.

```ts
// arrows-code/libs/validator/src/lib/placement.ts
import type { Graph, NodeId } from '@neo4j-arrows/model'
import type { Diagnostic, PatchOp } from '@arrows-code/patch'
import { boundingBoxOf, minSpacing } from './geometry'

const CODE = 'placement.overlap' as const

export function checkOverlaps(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  for (const [i, a] of graph.nodes.entries()) {
    for (const b of graph.nodes.slice(i + 1)) {
      if (overlap(boundingBoxOf(a), boundingBoxOf(b))) {
        diagnostics.push({
          severity: 'warning',
          code: CODE,
          message: `Nodes "${a.caption}" and "${b.caption}" overlap`,
          anchor: a.id,
          fix: spreadFix(a.id, b.id, minSpacing(a, b)),
        })
      }
    }
  }
  return diagnostics
}

function spreadFix(a: NodeId, b: NodeId, gap: number): PatchOp[] {
  return [{ type: 'movePos', node: b, dx: gap, dy: 0 }]
}
```

Conventions:
- One rule per file. File name is the rule category, not the diagnostic code.
- Diagnostic codes are dot-namespaced and exported as `const X = 'category.specific' as const` for literal-type narrowing.
- No `any`. Use `unknown` + narrowing at every external boundary (file I/O, MCP request, webview message).
- Immutability: functions return new arrays/objects; no in-place mutation. Inherited from arrows project rules.
- `*.spec.ts` co-located with implementation. Test names describe **observable behavior**, never internal mechanism.
- Pure functions where possible. Side effects (fs, vscode API, MCP transport) ring-fenced to thin shells at the edge.

## Testing strategy — TDD is mandatory

This is the part the user specifically called out. Read this section before writing any code in this subsystem.

### TDD loop (red → green → refactor)

For **every** new function, rule, tool, or command:

1. **RED.** Write the failing test first.
   - The test must fail because the behavior doesn't exist yet — not because of a syntax error.
   - Run `nx test <project> -- -t "<test name>" --reporter=verbose` and confirm the failure message is the assertion you expect.
2. **GREEN.** Write the minimum code that makes the test pass.
   - "Minimum" means: no error handling for cases the test doesn't cover, no abstractions for non-existent future tests, no logging.
   - Often the right green-bar implementation is `return diagnostics // empty for now` or a hardcoded value.
3. **REFACTOR.** With the green bar protecting you, improve structure.
   - Extract helpers, deduplicate, rename for clarity.
   - Tests still pass. If they break, you regressed; back out.
4. **REPEAT.** Add the next test. Triangulate behavior with multiple cases before generalising.

**Anti-pattern: writing tests after the code "to get coverage."** That's a confidence trick, not a design tool. A test you wrote after you saw the implementation pass cannot tell you the implementation is wrong — you wrote it to agree with what you already wrote. Tests written first force you to specify behavior before you know the implementation.

### Test pyramid (per layer)

| Layer | What it tests | How many | Where |
|---|---|---|---|
| **Unit** | One function, deterministic inputs/outputs, no I/O | majority (~70%) | `arrows-code/libs/*/src/lib/*.spec.ts` |
| **Integration** | Multiple units composed: parse → validate → render | meaningful slice (~20%) | `arrows-code/libs/*/src/integration/*.spec.ts` |
| **App-level** | MCP tool invocation, VS Code extension activation | targeted (~10%) | `arrows-code/apps/*/src/**/*.spec.ts` + `@vscode/test-electron` |
| **Visual regression** | SVG byte-identity vs arrows.app | per fixture | `arrows-code/fixtures/round-trip/` |
| **LLM smoke** | Cold Claude session can produce valid graph from prose | small set | `arrows-code/fixtures/llm-smoke/` (CI runs against real model on tag releases) |

### What to test (rule-by-rule)

For every validator rule, two minimum tests:
- **Positive:** a fixture that should trigger the diagnostic produces exactly one diagnostic with the right code, severity, and anchor.
- **Negative:** a fixture that should not trigger it produces zero diagnostics of that code.

For every MCP tool:
- **Contract test:** invocation with the documented input shape returns the documented output shape (JSON-schema match).
- **Happy path:** at least one realistic fixture passes through with the expected effect.
- **Error path:** malformed input returns a clean error, never crashes the transport.

For every format converter (JSON, YAML, Cypher export):
- **Round-trip:** `read(write(g)) ≡ g` for every fixture in `fixtures/round-trip/`.
- **Stability:** `write(g)` is byte-identical on consecutive calls (no map iteration order leakage).
- **Comment preservation** (YAML only): user comments survive a write-after-read cycle.

For every patch op:
- **Apply:** `apply(g, op)` produces the expected graph.
- **Validate:** invalid ops (`addRel` with non-existent `from`) return an error rather than corrupt the graph.
- **Determinism:** the same op against the same graph is idempotent under canonicalisation.

For renderer:
- **SVG parity:** for each fixture, our SVG output is byte-identical to arrows.app's existing "Save as SVG" output.
- **Deterministic IDs:** repeated renders produce identical SVG (no `Math.random` ids leaking).

For VS Code extension:
- **Activation:** opening a `.arrows` file activates the extension (`@vscode/test-electron`).
- **Bidirectional sync gauntlet** (manual + automated where feasible):
  - Text edit propagates to preview within one frame.
  - Drag in preview emits a single `WorkspaceEdit` with stable JSON key order.
  - Concurrent text edit + drag — drag drops if `document.version` changed; text wins.
  - Invalid JSON in editor → preview shows last-valid render + error banner; no crash.

### Coverage targets

- Per-file line coverage ≥ 85%, branch coverage ≥ 80%, on every `libs/` package in `arrows-code/`. Enforced via Vitest `coverage.thresholds` in each project's config.
- Mutation-testing (StrykerJS) on the validator: ≥ 70% mutation score. Validator logic is where bugs hide; line coverage isn't enough.
- App-level packages: coverage-informational only — focus on integration + manual gauntlet.

### TDD sequencing inside a task

When implementing a task, follow this micro-loop. Each row is one commit (or one logical change).

| # | Action | Time budget |
|---|---|---|
| 1 | Read the task acceptance criteria. Translate into 2-5 test names. | 2 min |
| 2 | Write the first failing test. Confirm it fails for the right reason. | 5 min |
| 3 | Write the minimum implementation to pass. | 10 min |
| 4 | Refactor under green bar. | 5 min |
| 5 | Add the next test. Repeat 2-4. | rolling |
| 6 | When all task tests pass: run full project tests + lint + typecheck. | 1 min |
| 7 | If green: mark task done. If not: do not advance to next task. | — |

A task that doesn't get tests written first is **not done**, even if the implementation looks correct.

## Boundaries

### Always

- Tests before code. Red → green → refactor.
- All new code lives under `arrows-code/`.
- Imports from arrows.app: only `@neo4j-arrows/{model,graphics,selectors}`. Nothing from `apps/arrows-ts/**`.
- Use `Graph`, `Node`, `Relationship`, `Point` types from `@neo4j-arrows/model` as the canonical model. Do not redefine.
- Run `nx affected -t lint,typecheck,test` before pushing.
- Diagnostic codes are stable, dot-namespaced, documented in `arrows-code/docs/validator-rules.md` (generated).
- Validator rules ship with a positive + negative test case in `fixtures/validator/{pass,fail}/`.
- New MCP tools are added to `arrows-code/docs/mcp-tools.md` with example input/output.

### Ask first

- Adding any dependency over 100KB minified.
- Changing the public shape of an MCP tool (rename, signature change) after publish.
- Touching files outside `arrows-code/` for anything other than the additive-export list in this spec.
- Bumping the canonical JSON shape (any field add/rename) — must coordinate with arrows.app.
- Anything that would couple the extension or MCP server to a specific Neo4j version.

### Never

- Re-implement node/relationship/styling/geometry logic that already exists in `@neo4j-arrows/{model,graphics}`.
- Mutate `Graph` objects in place. Always return new copies.
- Skip the failing test. Skipping `.skip` / `.only` are merge blockers.
- Commit `.vsix` builds, secrets, or `.env` files.
- Crash an MCP request on malformed input — always return a structured error response.
- Edit `apps/arrows-ts/**` for the new subsystem's benefit. If `arrows-ts` needs to change, that's a separate PR with its own justification.
- Use `any` outside narrowed boundary code; use `unknown` + a parser.

## Success criteria — DONE

Each component has a clear "DONE" gate. Nothing merges that doesn't satisfy its gate.

### `libs/format-json` — DONE when

- [ ] Read accepts every graph in `fixtures/round-trip/` without diagnostics.
- [ ] `read(write(g))` is structurally equal to `g` for every fixture (Vitest `toEqual` after canonicalization).
- [ ] `write(g)` is byte-stable across 100 consecutive calls (sort keys, ordered arrays).
- [ ] Read of a graph saved by current arrows.app (Google Drive fixture) matches `constructGraphFromFile` output.
- [ ] ≥ 85% line, ≥ 80% branch coverage.

### `libs/format-yaml` — DONE when

- [ ] All `libs/format-json` gates above, applied to YAML.
- [ ] User-added comments in a YAML file survive `read → write` round-trip (byte-identical comment placement using the `yaml` Document API).
- [ ] Conversion `.arrows` ↔ `.arrows.yaml` preserves canonical JSON identity.

### `libs/validator` — DONE when

- [ ] Every diagnostic code listed in this spec has a positive + negative test fixture and a passing test.
- [ ] Mutation score (Stryker) ≥ 70%.
- [ ] Auto-fix proposals (`fix: PatchOp[]`) actually clear the diagnostic when applied — proven by a generic test that loops every fixture's `fix` through `apply_patch` then re-validates.
- [ ] Validator runs on the largest fixture in `fixtures/examples/` in < 50ms (perf budget).
- [ ] Rule reference doc `arrows-code/docs/validator-rules.md` regenerates and matches code.

### `libs/patch` — DONE when

- [ ] Every `PatchOp` variant has apply + validate tests.
- [ ] `apply(g, ops)` is associative on commuting ops, deterministic, and never produces a graph that fails structural validation if it started valid.
- [ ] Reusable identically in extension + MCP (proven by integration test importing from both).

### `libs/graphics` (additive exposure) — DONE when

- [ ] `renderGraphToSvg(graph)` exported.
- [ ] SVG output is byte-identical to existing arrows.app "Save as SVG" for every fixture in `fixtures/round-trip/`.
- [ ] No regression in `apps/arrows-ts` tests.

### `apps/vscode-arrows` — DONE when

- [ ] Manual bidirectional gauntlet (below) passes.
- [ ] Extension activates in < 500ms on a 1MB `.arrows` file.
- [ ] `@vscode/test-electron` covers: activation, custom editor registration, command palette entries, postMessage round-trip with a stub webview.
- [ ] `.vsix` builds, installs, and operates in a fresh VS Code profile.
- [ ] Validator diagnostics surface in the editor's Problems panel.

**Manual gauntlet (all must pass before merge):**
1. Open `fixtures/examples/social.arrows` → preview renders, byte-identical SVG to arrows.app web render.
2. Type a new node into the JSON → preview updates within one frame.
3. Drag a node in preview → editor receives a `WorkspaceEdit` with only the position change, stable JSON key order.
4. Validate-on-save shows three known diagnostics from a deliberately-broken fixture; all clear after `auto_fix`.
5. Switch file from `.arrows` to `.arrows.yaml` via command → graph identity preserved, comments preserved.
6. Rapid typing during drag → drag op drops, editor wins, no torn state.
7. Invalid JSON → diagnostics shown, preview shows last-valid render with a banner; no crash.
8. Close and reopen the file → state restored.

### `apps/mcp-arrows` — DONE when

- [ ] All 13 tools listed in this spec implemented, each with contract + happy + error path tests.
- [ ] All resources listed implemented; `style-schema` and `validator-rules` regenerate from source.
- [ ] All prompts present.
- [ ] `claude mcp add arrows -- npx @neo4j-labs/mcp-arrows` works locally (smoke).
- [ ] **LLM smoke test:** in a cold Claude session with only this MCP configured, the prompt *"Model a Twitter-like graph with Users, Tweets, Likes, Follows. Lay it out nicely and pick a palette."* produces a graph that:
  - parses cleanly,
  - has ≥ 4 labels and ≥ 8 nodes,
  - has positions for every node with zero overlaps,
  - has WCAG-AA-clean colors,
  - passes `validate_arrows` with zero warnings after one `auto_fix` pass.

### Overall subsystem — DONE when

- [ ] All component DONE gates pass.
- [ ] `arrows-code/` can be deleted in a branch and `apps/arrows-ts` still builds, tests, and serves identically. (Run `nx affected -t test --base=main` after a delete-arrows-code branch to confirm.)
- [ ] CI matrix runs lint + typecheck + test for every `arrows-code-*` project on every PR.
- [ ] `arrows-code/docs/architecture.md` exists and matches the implementation.
- [ ] At least one external user (outside this thread) successfully installs the extension + MCP server from published artifacts and produces a valid `.arrows` file from prose.

## Existing-behavior integration map (the ultrathink)

Closer reading of the codebase reveals the renderer is not where the earlier passes assumed. This section catalogs every existing arrows behavior, classifies it, and states exactly how `arrows-code` integrates with it. Treat it as the contract.

### Classification of existing code

| Bucket | Description | Locations | Treatment in `arrows-code` |
|---|---|---|---|
| **A — pure reusable lib** | Domain model, geometry, value parsing, palette, themes | `libs/model/src/lib/{Graph,Node,Relationship,Point,Vector,Size,ViewTransformation,Id,attachments,selection,gang,values,labels,properties,colors,fonts,styling,themes,constants,applicationLayout}.ts` | Import as-is. No edits beyond making the package npm-publishable. Canonical source of truth for every type the new subsystem touches. |
| **B — graphics primitives** | Per-component definitions (arrow heads, labels, captions, attachments) | `libs/graphics/src/lib/*.ts` | Import as-is. These describe what gets drawn; they're renderer-agnostic. |
| **C — Canvas renderer** | Actual draw-to-Canvas pipeline | `apps/arrows-ts/src/graphics/{canvasRenderer,visualsRenderer,VisualGraph,VisualNode,VisualRelationship,...}.js` | **Hot zone.** This is JS, app-coupled, Canvas-only. Needs an audit (Phase 0) to find or extract an SVG path. See "Renderer reality check" below. |
| **D — storage adapters** | Save/load to JSON, Google Drive, Neo4j, Cypher | `apps/arrows-ts/src/storage/{exportCypher,googleDriveStorage,neo4jStorage,clusterCypherQueries,cypherReadQueries,cypherWriteQueries,localFileId}.js` | `exportCypher.js` + `googleDriveStorage.js#constructGraphFromFile` relocate to `libs/format-cypher/` and `libs/format-json-core/` (additive PR to web app, no logic change). Others stay app-only — out of scope. |
| **E — Redux actions** | Imperative graph mutations | `apps/arrows-ts/src/actions/{graph,selection,export,import,mouse,dragToCreate,gang,viewTransformation,geometricSnapping,...}.js` | Out of scope for direct reuse. We replicate the **operations** (not the actions) via `libs/patch` `PatchOp`s. The patch op set is derived from this list — every meaningful Redux action becomes a `PatchOp` variant. |
| **F — Redux reducers** | State transitions | `apps/arrows-ts/src/reducers/*.js` | Out of scope; reducers operate on Redux state shape, our patches operate on `Graph`. They're isomorphic but we don't depend on the Redux runtime. |
| **G — interactions** | Mouse/keyboard handlers | `apps/arrows-ts/src/interactions/{MouseHandler,Keybindings}.{ts,js}` | Out of scope for v1. Webview drag-edit in the extension comes via webview-level events, not by mounting the Canvas pipeline. See "Renderer reality check". |
| **H — app shell** | React UI, dialogs, toolbars | `apps/arrows-ts/src/components`, `containers`, `state`, `app`, `main.tsx` | Out of scope entirely. |
| **I — existing tests** | Vitest specs already in the tree | `libs/model/src/lib/Id.test.ts`, `labels.test.js`, `properties.test.js`, `values.test.js`; `apps/arrows-ts/src/storage/exportCypher.test.js`; `apps/arrows-ts/src/graphics/{bisect,circumferentialDistribution}.test.js` | Reuse as oracle. New validator + format tests assert against the same fixtures/expectations where overlap exists. |

### Renderer reality check

The hopeful "embed the actual arrows-ts app in the webview" assumed a clean Canvas/SVG split. The file listing says otherwise — Canvas is woven through `apps/arrows-ts/src/graphics/`. Honest plan:

- **Phase 0 audit answers two questions:**
  1. Does an SVG render path exist anywhere, or does the README's "export as image" mean PNG-from-Canvas only?
  2. How tightly is `canvasRenderer.js` / `visualsRenderer.js` coupled to React, the Redux store, and the DOM? Can it be invoked on a detached canvas with just a `Graph`?
- **Three contingencies** depending on what the audit finds:
  - **Best case** — an SVG export already exists buried in storage or actions: relocate it; we're done with rendering.
  - **Middle case** — Canvas renderer is decoupleable into a function `render(ctx, graph, style)`: write a thin SVG-canvas shim that records draw calls and emits SVG (canvas-to-svg pattern). Reuses all visual logic without rewriting it.
  - **Worst case** — Canvas renderer is deeply coupled and not portable: extract a `Visual*` walker that knows how to read `libs/graphics` primitives and emit SVG directly. Bigger one-time cost, still no logic duplication (model + primitives stay canonical).
- **Schedule impact:** Phase 0 estimate is one focused PR (read-only + a stub export). The contingency picked there governs whether `apps/vscode-arrows` ships read-only first or with full bidirectional.

This is the spec's largest unknown and it gets resolved before any other code.

### Per-feature integration map

For each arrows.app feature, the behavior the new subsystem preserves, validates, or extends:

| Feature | Where it lives now | `arrows-code` treatment |
|---|---|---|
| Node, Relationship, Property, Label CRUD | `libs/model` types + Redux actions | `libs/patch` ops are 1:1 with the meaningful Redux actions. Model types reused. |
| Styling (`completeWithDefaults`, every style key) | `libs/model/src/lib/styling.ts` | `libs/validator/color.ts` + `libs/palette/` consult `styling.ts`'s key list as the single source of truth. `arrows://spec/style-schema` MCP resource is **generated** from `styling.ts` at build time. |
| Themes | `libs/model/src/lib/themes.ts` | `libs/palette/themes.ts` re-exports + adds palette generators. `suggest_palette` MCP tool can apply existing themes by name. |
| Positions (`Point`, view transformations) | `libs/model/src/lib/{Point,Vector,Size,ViewTransformation}.ts` | Reused. `libs/layout` returns new `Point`s; `libs/validator/placement.ts` uses these for overlap math. |
| Gangs (node groups) | `libs/model/src/lib/gang.ts` + `apps/arrows-ts/src/reducers/gangs.js` | First-class. `format-json` round-trips gangs. `libs/validator` has a rule for empty/orphan gangs. `libs/patch` includes `addGang`, `assignToGang`, `removeFromGang` ops. **Critical:** never strip unknown gang metadata. |
| Parameters (`$paramName`) | `libs/model/src/lib/values.ts` (parsing) + properties | `libs/validator/parameters.ts` (rule layer 6) enforces refs. `apply_patch` ops include `setParameter`. |
| Properties (typed values) | `libs/model/src/lib/{properties,values}.ts` | Property value parser reused verbatim. `libs/validator/propertyTypes.ts` builds on `values.ts` type inference. |
| Selection / marquee | `libs/model/src/lib/selection.ts` + interactions | Not part of v1 file format. Webview-only (transient UI state). |
| Geometric snapping | `apps/arrows-ts/src/actions/geometricSnapping.ts` | Used by `libs/layout` (snap-to-grid layout mode). Not validator-relevant. |
| Attachments (where rels connect on nodes) | `libs/model/src/lib/attachments.ts` | Reused. `libs/validator/placement.ts` reasons about attachment to compute clean overlap thresholds. |
| Cypher export | `apps/arrows-ts/src/storage/exportCypher.js` (+ its `.test.js`) | Relocated to `libs/format-cypher/`. MCP `export_cypher` tool calls it. Validator's `cypherSanity.ts` rule layer 7 runs it and checks the output for Neo4j-reserved-word collisions. |
| Cypher read/write queries (live DB) | `apps/arrows-ts/src/storage/{cypherReadQueries,cypherWriteQueries,clusterCypherQueries}.js` | Out of scope for v1. Foundation for `compare_to_neo4j` MCP tool in Phase 2. |
| Neo4j storage | `apps/arrows-ts/src/storage/neo4jStorage.ts` | Out of scope (per README, mostly disabled). Phase 2 only. |
| GraphQL export | `apps/arrows-ts/src/graphql/exportGraphQL.js` | Relocated or wrapped. MCP `export_graphql` tool. |
| JSON import / paste | `apps/arrows-ts/src/actions/import.js`, `storage/googleDriveStorage.js` | `constructGraphFromFile` relocates to `libs/format-json-core`; `libs/format-json` (in `arrows-code/`) wraps it for the file-based use case. |
| Tab-separated text import | `apps/arrows-ts/src/actions/import.js` | Out of scope for `arrows-code`. App-specific paste feature. |
| SVG / PNG export | `apps/arrows-ts/src/actions/export.ts` + Canvas pipeline | **Phase 0 audit target.** See Renderer reality check. |
| Google Drive auth/storage | `apps/arrows-ts/src/{googleDriveAuth.js,googleDriveConstants.js,storage/googleDriveStorage.js}` | Untouched. VS Code extension uses the workspace filesystem. |
| Undo / redo | `redux-undo` in the web app | Webview embed inherits if/when we mount the Redux store. Otherwise, VS Code's native undo handles the text file. The drag-edit op stack mirrors VS Code's undo stack via `WorkspaceEdit`. |
| Service worker / PWA | `apps/arrows-ts/src/registerServiceWorker.js` | Untouched. |
| Diagram name | `actions/diagramName.js` + `reducers/diagramName.js` | Round-tripped in JSON/YAML as a top-level field. |
| View transformation (zoom/pan) | `actions/viewTransformation.js` | Webview-only transient state. Not part of file format. |
| Cached images / icons | `actions/cachedImages.js` | Out of scope. Phase 2 if icon support added to MCP. |
| Dialogs / app layout | `applicationDialogs.js`, `applicationLayout.js` | Out of scope (UI chrome). |

### Existing tests we lean on (don't duplicate)

| Existing test | Used as |
|---|---|
| `libs/model/src/lib/Id.test.ts` | Oracle for id-generation behavior in patch ops. |
| `libs/model/src/lib/labels.test.js` | Oracle for label normalization in validator naming rule. |
| `libs/model/src/lib/properties.test.js` | Oracle for property key/value semantics in `libs/format-*`. |
| `libs/model/src/lib/values.test.js` | Oracle for parameter parsing in validator parameters rule. |
| `apps/arrows-ts/src/storage/exportCypher.test.js` | Oracle for `libs/format-cypher` after relocation; new tests extend, not replace. |
| `apps/arrows-ts/src/graphics/bisect.test.js`, `circumferentialDistribution.test.js` | Oracle for layout math used in `libs/layout`. |

Pattern: when implementing a new rule whose behavior overlaps an existing test, **import the same fixtures** the existing test uses. Don't invent new ones that drift.

## Implementation craft — how to write each thing masterfully

How the code itself should be written. Templates, anti-patterns, and review criteria.

### Validator rule (the most repeated pattern)

A validator rule is one file. Shape:

```ts
// libs/validator/src/lib/<category>.ts
import type { Graph } from '@neo4j-arrows/model'
import type { Diagnostic, PatchOp } from '@arrows-code/patch'

export const CODES = {
  overlap: 'placement.overlap',
  offCanvas: 'placement.off-canvas',
} as const

export function checkPlacement(graph: Graph): Diagnostic[] {
  return [
    ...checkOverlaps(graph),
    ...checkOffCanvas(graph),
  ]
}

function checkOverlaps(graph: Graph): Diagnostic[] { /* pure */ }
function checkOffCanvas(graph: Graph): Diagnostic[] { /* pure */ }
```

Rules every rule file obeys:
- Exported `CODES` const for stable diagnostic identifiers; tests assert on these.
- The top-level `check<Category>` is a pure pipeline of sub-checks. No state, no I/O.
- Each sub-check returns `Diagnostic[]` (possibly empty) — never throws.
- Auto-fix proposals are co-located. A rule that proposes fixes ships fixes that actually clear the diagnostic (covered by the generic auto-fix loop test in DONE).
- `*.spec.ts` next to the rule file has the positive + negative test pair per code.

Anti-patterns to reject in review:
- Mutating the `graph` argument.
- Throwing on malformed input. Return a diagnostic instead.
- Importing from `apps/arrows-ts/**`. Boundaries enforced.
- Sharing helpers across rule files via a `utils.ts` grab bag — extract named, single-purpose modules instead.

### MCP tool (the second-most-repeated pattern)

```ts
// apps/mcp-arrows/src/tools/validate.ts
import { z } from 'zod'
import { defineTool } from '../sdk'
import { readGraph } from '@arrows-code/format-json'
import { validate } from '@arrows-code/validator'

const Input = z.object({
  graph: z.union([z.string(), z.object({/* Graph shape */})]),
})

export const validateArrows = defineTool({
  name: 'validate_arrows',
  description: 'Validate a graph and return diagnostics across structural, naming, property-type, placement, color, parameter, and Cypher-sanity layers.',
  inputSchema: Input,
  handler: async (input) => {
    const graph = typeof input.graph === 'string' ? readGraph(input.graph) : input.graph
    return { diagnostics: validate(graph) }
  },
})
```

Rules:
- One tool per file. File name === tool name.
- Input schema declared once with Zod, exported for tests.
- Handler is a thin orchestration over libs — zero business logic.
- Errors return structured responses, never throw past the transport (caught + serialized).
- Every tool ships a contract test (`validateArrows.inputSchema.parse(example)` passes) and a happy-path test against a real fixture.

### Format converter

The format converters are the boundary of trust — they take untrusted text and produce typed `Graph`. Treat them like parsers:

- Parse, don't validate. The function signature is `read(text: string): { graph: Graph, diagnostics: Diagnostic[] }` — never `read(text): Graph` that throws.
- Stable output. `write` is deterministic: ordered keys, ordered arrays where order is significant, **alphabetical key order** in JSON for diff-friendliness, comment-preserving in YAML.
- Round-trip test is mandatory. `read(write(g))` for every fixture, in both formats.
- Never lose unknown fields. If the file has a top-level key we don't recognize, preserve it through write. Forward-compat insurance.

### Patch op

Every `PatchOp` variant follows the same shape:

```ts
type PatchOp =
  | { type: 'addNode'; id?: NodeId; label: string; position?: Point; properties?: PropMap; style?: StyleMap }
  | { type: 'movePos'; node: NodeId; dx: number; dy: number }
  | { type: 'setProperty'; entity: NodeId | RelId; key: string; value: Value | null }
  // ... etc
```

- Tagged union, never a class hierarchy.
- `apply(graph: Graph, op: PatchOp): Graph` — pure, returns a new graph.
- `validate(graph: Graph, op: PatchOp): Diagnostic[]` — surfaces issues without applying (used to preview an edit before committing).
- Composition: `apply(g, [op1, op2, op3])` = `apply(apply(apply(g, op1), op2), op3)`. Tested.

### VS Code extension

- The extension entrypoint (`extension.ts`) does almost nothing — registers, wires up.
- All sync logic in `sync/toPreview.ts` and `sync/fromPreview.ts` — testable as pure transforms.
- Webview HTML is a static asset; the JS bundle is built from `libs/renderer-host` so the webview code is itself unit-tested.
- Document version checks on every webview-originated edit. Never apply a stale edit.

### Reviewing your own code before opening a PR

Check each before commit:

1. Did I write the test first? If you can't honestly say yes, redo it.
2. Is this file under 200 lines? If not, split.
3. Did I touch any file outside `arrows-code/` other than the additive-export list in this spec?
4. Does `nx affected -t lint,typecheck,test` pass clean?
5. If I deleted `arrows-code/` from the repo, does `apps/arrows-ts` still build and test green?
6. Is every public function in the new module reachable from a test in the same package?
7. Did I import anything from `apps/arrows-ts/**`? If yes, that's a boundary violation — extract first.

Each "no" is a merge blocker.

## Open questions

1. **Library publication scope** — do we publish `@neo4j-arrows/{model,graphics,selectors}` to public npm, to a Neo4j-internal registry, or keep them path-aliased only? Affects the future-split story.
2. **Webview interactive editing** — full bidirectional was locked in v1. If `libs/graphics`'s SVG export is heavily coupled to the React tree, decoupling cost may push us toward a Phase 1.5 (read-only preview, drag-edit deferred). Need the Phase-0 audit before locking the schedule.
3. **MCP transport** — stdio only for v1, or also HTTP for hosted-agent use cases?
4. **YAML schema strictness** — should `.arrows.yaml` accept terser shapes (e.g. `rels: [alice -> bob :KNOWS]`) or stay 1:1 with the JSON structure?
5. **Auto-fix safety** — should `auto_fix` always be opt-in per diagnostic code, or apply all "safe" fixes by default? Different LLMs may want different defaults.

## Sequencing (Phase 0 → Ship)

1. **Phase 0 — Audit (read-only, 1 PR).** Trace SVG export + chrome/core coupling in `apps/arrows-ts`. Document the seam. Output: `arrows-code/docs/decoupling.md` (yes, before the rest of the subsystem exists) + a stub for the additive `renderGraphToSvg` export.
2. **Spec freeze.** Resolve the five Open Questions. Lock canonical JSON shape. No new features added below this line without spec amendment.
3. **`libs/format-json` + `libs/format-yaml`.** TDD. Fixture-driven.
4. **`libs/validator`.** Layer by layer (structural → naming → property-types → placement → color → parameters → cypher-sanity). Each layer ships with its full positive/negative fixture set before moving to the next.
5. **`libs/patch` + `libs/layout` + `libs/palette`.** TDD.
6. **`libs/renderer-host` + `libs/graphics` additive export.** Parity-test against arrows.app.
7. **`apps/mcp-arrows`.** Compose existing libs. No new business logic.
8. **`apps/vscode-arrows`.** Compose existing libs + renderer-host. Manual gauntlet.
9. **External-user dogfood.** Ship `.vsix` + npm package to a small group; collect feedback; iterate before public release.
10. **Phase 2 (post-ship).** Cypher-import tool, live-Neo4j compare, web-app YAML side-panel, Mermaid external-diagram plugin.
