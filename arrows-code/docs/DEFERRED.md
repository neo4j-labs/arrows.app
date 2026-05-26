# Deferred work — open items for future sessions

This file is the working register of everything `arrows-code` plans to ship but hasn't. Each item lists what's missing, why it matters, where to start, and rough effort. Keep this file honest — when something lands, move it to the CHANGELOG and delete the entry here.

The five Critical / Important fixes from the prior audit are already shipped (see CHANGELOG). What remains below is scope work that needs more time than a single session.

---

## U1. Validator — 6 of 7 rule layers absent

**State:** Only `structural.ts` is implemented (duplicate ids, ref integrity, required fields, unknown style keys). `validator/src/lib/index.ts` says "v1 ships structural; future layers compose here."

**Missing layers** (each in its own file under `libs/validator/src/lib/`):

| Layer | Catches |
|---|---|
| `naming.ts` | PascalCase labels, SCREAMING_SNAKE_CASE rel types, camelCase properties |
| `propertyTypes.ts` | Same-label same-key type drift (`age: 30` vs `age: '30'` across nodes) |
| `placement.ts` | Node overlap, off-canvas, edge crossings, clustering |
| `color.ts` | Color parse, WCAG contrast, palette discipline |
| `parameters.ts` | `$paramName` reference integrity, unused bindings |
| `cypherSanity.ts` | Reserved-keyword collisions that would break `export_cypher` |
| `fixes.ts` | `PatchOp[]` proposals per diagnostic — required by the LLM `auto_fix` smoke gate |

**Pattern to follow:** one file per layer, exported `check<Layer>(graph): Diagnostic[]`. `validate()` composes them in order. Positive + negative fixture per diagnostic code under `fixtures/validator/{pass,fail,<code>/}`.

**Effort:** 2–3h per layer. Stryker mutation testing (≥70% per SPEC DONE-gate) on top is another 1-2 days.

**Entry points:** `arrows-code/libs/validator/src/lib/structural.ts` is the template. `arrows-code/libs/validator/src/lib/types.ts` already defines the `Diagnostic` shape.

---

## U2. MCP server — 7 of 13 tools missing, all 5 prompts missing

**State:** Implemented = `render_arrows`, `render_arrows_svg`, `validate_arrows`, `apply_patch`, `describe_schema`, `export_cypher`.

**Highest-value missing:**

| Tool | Why it matters |
|---|---|
| `auto_fix` | Required for the SPEC's LLM smoke gate ("zero warnings after one auto_fix pass"). Compose `validate` + `apply` once `validator/fixes.ts` exists. ~2h. |
| `suggest_layout` | LLMs are bad at coordinates. Without this, every LLM-generated graph fails placement checks. `d3-force` + deterministic seed. ~3h. |
| `lint_arrows` | Thin wrapper over `validate_arrows` with severity filtering. ~30min. |
| `diff_graphs` | Needed for live-Neo4j compare + selection export. Build the `graph-subset` lib first (see U7). ~3h after subset exists. |
| `explain_graph` | Markdown summary from `describe_schema`. Big LLM UX win, low effort. ~2h. |

**Drop:**
- `suggest_palette` — themes already exist in `libs/model/themes.ts`. Expose as a resource (`arrows://spec/themes` exists already), skip the tool.
- `export_graphql` — niche; relocate `apps/arrows-ts/src/graphql/exportGraphQL.js` to `libs/format-graphql/` only if a user asks.

**Prompts (`apps/mcp-arrows/src/prompts/`):** entire directory missing. SPEC lists `fromDescription.ts`, `refactor.ts`, `review.ts`, `fromCypherQuery.ts`, `harmonize.ts`. These are short — MCP prompts are templated strings with named parameters. ~1h for all five.

**Resources:** missing `arrows://spec/yaml-projection` (depends on `format-yaml`, see U3), and `arrows://spec/validator-rules` (generate from the rule code in U1).

**Entry points:** `arrows-code/apps/mcp-arrows/src/lib/tools.ts` (current 5 tools), `arrows-code/apps/mcp-arrows/src/lib/resources.ts` (resource pattern).

---

## U3. Whole libs absent: `format-yaml`, `layout`, `palette`

**`format-yaml`** — SPEC promised a comment-preserving YAML projection of the canonical JSON, using Eemeli's `yaml` Document API. Use case: humans prefer reading YAML for ~10-node graphs. No consumer exists today; defer until a user requests it. SPEC lines 187–192 describe the round-trip and comment-preservation requirements.

**`layout`** — needed to back `suggest_layout`. If the MCP tool inlines `d3-force` for v1, the lib is overkill. Promote to a real lib only when force/hierarchical/grid/radial layouts each need separate code paths. ~1 day to make it idiomatic.

**`palette`** — same story. Themes live in `@neo4j-arrows/model/themes.ts`. A real `palette` lib would add generators (analogous, complementary, triadic) + WCAG checks. Only worth it if/when the validator's `color.ts` layer needs to generate fixes rather than just check.

**Entry point:** create `arrows-code/libs/<name>/` mirroring an existing lib's project.json and tsconfig.

---

## U4. Patch ops — gangs and parameters

**State:** 15 op variants covering nodes, relationships, properties, labels, types, style. **Missing** what SPEC's integration map specifically calls out:

- `addGang { id }`, `assignToGang { gangId, entityId }`, `removeFromGang { gangId, entityId }` — required before any multi-graph UI surfaces in the embed. The data model in `@neo4j-arrows/model/gang.ts` already exists; just needs op variants + apply branches.
- `setParameter { name, value }` — used by LLM agents to bind `$param` placeholders.

**Effort:** ~2h. Add variants to `libs/patch/src/lib/types.ts`, branches in `apply.ts`, Zod entries in `mcp-arrows/src/lib/tools.ts` `PatchOpSchema`, spec tests. Pattern is identical to existing op variants.

**Entry points:** `arrows-code/libs/patch/src/lib/types.ts`, `arrows-code/libs/patch/src/lib/apply.ts`.

---

## U5. Fixture directories empty

- `fixtures/round-trip/` — required by SPEC DONE-gate for format-json (round-trip byte equality + SVG byte parity with arrows.app).
- `fixtures/validator/pass/` and `fixtures/validator/fail/<code>/` — required by each validator layer (positive + negative per diagnostic).
- `fixtures/llm-smoke/` — prompts + expected schema shapes for the cold-Claude-session smoke test.

Each fixture is a small `.arrows` file. Populate as the corresponding validator layer / format converter is built — don't pre-populate without a consumer.

---

## U6. `docs/` — only `decoupling.md` exists

Missing:
- `docs/architecture.md` — the SYNC protocol, bridge state machine, listener ordering contract. Most of this content already lives in `CLAUDE.md`; promote the technical sections out into a proper architecture doc.
- `docs/validator-rules.md` — generated from rule code once U1 progresses. Each rule's code, severity, what triggers it, available auto-fix.
- `docs/mcp-tools.md` — schema + example input/output for each MCP tool. Update as U2 lands.
- `docs/SYNC.md` — the README references this file. The bridge protocol details (emit history, TTL, isUserBusy invariant, applyChain serialization) deserve a dedicated doc.

---

## U7. `graph-subset` utility doesn't exist

**Why this is on the list:** four future features need the same primitive — `selectSubgraph(graph, ids): Graph` — and none of them can ship without it.

Consumers:
- Copy/paste between `.arrows` files (clipboard adapter)
- `diff_graphs` MCP tool
- "Export selection as SVG" command
- Multi-graph gangs UI (when implemented)

**Implementation:** new lib `arrows-code/libs/graph-subset/`. Take a `Graph` + `Set<NodeId | RelId>`, return a new `Graph` containing only those entities + the relationships whose endpoints are both included. Properties + style preserved. ~2h.

---

## U8. SPEC's decoupling claim is partially false — decide which way to honor it

**Reality today:**
- `arrows-code/` itself imports only from `@neo4j-arrows/{model,graphics,selectors}` — clean.
- BUT the embed lives in `apps/arrows-ts/src/embed/` because it needs the host's reducers, containers, and actions. That's ~18 files plus a `vite.config.ts` rollup-input branch.

`git rm -r arrows-code/` would leave the embed dead code, not break it. So the SPEC promise ("delete arrows-code/ and nothing else moved") doesn't quite hold.

**Two paths:**

1. **Amend SPEC.md** to acknowledge the embed as an in-tree sibling deliverable. Cheap, honest. ~30min.
2. **Relocate** `apps/arrows-ts/src/embed/` into `arrows-code/apps/embed/` and have the host expose its store/reducers as `@neo4j-arrows/app-runtime`. Real refactor, ~1 week.

Recommend #1 for now. Revisit #2 only if a user actually tries to split `arrows-code/` into its own repo.

---

## U9. Performance — bundle slimming and runtime hotspots

**Bundle (already shipped):** stripped 11 unused Semantic UI font files (brand-icons + `.eot`/`.ttf`/`.svg` legacy formats) at build time in `scripts/build.mjs`. `.vsix` dropped from 3.10MB → 2.42MB; embed bundle from 3.0MB → 1.5MB.

**Deeper bundle cuts available, deferred:**

- **`applicationLayout-*.css` is 540KB** — almost entirely Semantic UI base styles for components we don't use (Card, Statistic, Step, Feed, etc.). PurgeCSS + a manual safelist of the components actually mounted in the embed (`Button`, `Form`, `Form.Field`, `Segment`, `Modal`, `Icon`, `ButtonGroup`, `Divider`, `Input`, `Label`) would likely cut this to ~80KB. Estimate: 4-6h to get the safelist right without breaking the inspector.
- **`applicationLayout-*.js` is 656KB** — React + Redux + redux-undo + redux-thunk + react-redux + semantic-ui-react + the entire arrows-ts inspector tree. The inspector loads even if no selection exists. Code-split with `React.lazy(() => import('./EmbedInspectorPanel'))` and a Suspense fallback. Estimate: 2-3h. Expected saving: 150-200KB off first-paint.
- **`main-*.js` (108KB)** — the non-embed entry. Vite is building it because `vite.config.ts` has two HTML entries (`index.html` + `embed.html`). We don't ship the main app in the `.vsix`. Drop it from the bundle by either splitting the Vite config or by post-processing build.mjs to delete `dist/apps/arrows-ts/index.html` + its hashed assets before copying. Estimate: 30min.

**Runtime hotspots:**

- **`canonical()` in `bridge.ts`** runs twice per emit (once for emit history, once for `lastSerialized` comparison) and once per inbound load. Key-sorted recursive serialization allocates a new sorted object per nested object. For ~100KB graphs this is ~0.5ms — fine. For multi-MB graphs in sustained drag (60Hz), it'd stall the canvas. **Mitigations** if it becomes a problem: (1) cache the canonical string at the call site of `rememberEmit` so we only compute it once, (2) replace with a streaming FNV-1a hash that doesn't allocate per node, storing 8-byte hashes instead of full canonical strings. ~3h to land both.

- **`hitTestAt` thunk on every mousemove** while pan tool is active updates the cursor based on `visualGraph.entityAtPoint(graphPos)`. `entityAtPoint` linear-scans nodes/rels. With 10,000+ entities, that's ~5ms per move × 60Hz = 30% of CPU during pan-hover. **Mitigation:** throttle the cursor update via `requestAnimationFrame` so at most one hit-test fires per frame. ~1h.

- **`prune()` walks the entire `emittedAt` Map** on every emit + every inbound load. At sustained 60Hz with 30s TTL, the map can hold ~1800 entries — pruning means iterating all of them. **Mitigation:** make the Map insertion-ordered (which JS Maps already are) and prune from the head until the oldest entry is within TTL. Stops on first non-expired entry, amortized O(1). ~30min.

**Activation cost:** `dist/extension.js` is 344KB — parses in ~50-100ms cold. Activation triggers (`onLanguage:arrows`, `onCommand:arrows.newGraph`, `onView:arrowsExplorer`) all fire on a user-visible action, so this is amortized. No work to do.

## Other accumulated notes

- **`shouldEmit`** is now thin (calls `isUserBusy` from `userBusy.ts`). When adding a new transient state slice (marquee, connecting, etc.), edit `userBusy.ts` ONLY. The listener ordering contract for keydown is comment-locked in `EmbedKeybindings.tsx`.
- **Playwright** suite has stubs (`.skip`) for ring-drag, PNG export, themes panel, copy-paste between graphs, multi-graph gangs. Unskip as each feature lands.
- **Bridge emit history** now uses 30-second time-based expiry, not a 64-entry FIFO. Don't reintroduce the FIFO — under sustained editing it caused the rapid-edit-reversal bug.
- **CSP** is nonce-based (no more `'unsafe-inline'` for scripts). When editing `embed.html`, any new `<script>` tag will automatically receive the per-load nonce via `buildHtml`'s regex.
- **`arrows.newFromExample` and `arrows.deleteFile`** validate inputs against the bundled-examples root / workspace folders respectively. Don't relax this — both are public commands.
