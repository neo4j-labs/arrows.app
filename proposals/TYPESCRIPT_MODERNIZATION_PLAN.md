# Incremental JavaScript → TypeScript Modernization Plan

This document outlines a phased approach to modernizing the Arrows app from JavaScript to TypeScript, considering dependency updates, feature interdependencies, and migration direction.

---

## 1. Current State Summary

### 1.1 What’s Already TypeScript

- **Libs (fully TS):**
  - `libs/model` – core domain (Graph, Node, Relationship, Id, Point, Vector, styling, selection, guides, etc.). A few tests remain `.test.js`.
  - `libs/graphics` – visual types (VisualGraph, VisualNode, etc.). Surface is small; most rendering lives in the app.
  - `libs/selectors` – layers and inspection only.

- **App `arrows-ts`:**
  - Entry: `main.tsx`, `app/App.tsx`, `reducers/index.ts`.
  - A handful of modules: `config.ts`, `actions/export.ts`, `actions/geometricSnapping.ts`, `storage/neo4jStorage.ts`, `interactions/Keybindings.ts`, `global.d.ts`.

- **Tooling:** Nx 16, Vite 4, TypeScript 5.0, Vitest, ESLint (TS + JS), `allowJs: true` in app tsconfig.

### 1.2 What’s Still JavaScript

- **App `arrows-ts` (main migration target):**
  - **~250+ .js files:** reducers (18), actions (most), selectors, middlewares, storage, graphql, and **in-app copies** of model/graphics/selectors under `src/model/`, `src/graphics/`, `src/selectors/`.
  - **~40+ .jsx files:** all under `components/`, `containers/`, and one `graphics/utils/SvgAdaptor.jsx`.

- **App `arrows-app`:** Legacy JS app (duplicate structure); can be deprecated or migrated after `arrows-ts`.

- **Remaining .test.js:** In `libs/model`, `libs/graphics`, and app (e.g. `storage/exportCypher.test.js`).

### 1.3 Critical Architectural Detail: Duplicated Code

The app does **not** primarily use the shared libs. It still relies on **local copies** under `apps/arrows-ts/src/`:

- **`src/model/`** – Used by reducers, storage, selectors, state (e.g. Point, Graph, styling, properties, labels, guides, relationshipBundling). Only `App.tsx` imports from `@neo4j-arrows/model` (e.g. `computeCanvasSize`, `inspectorWidth`).
- **`src/graphics/`** – Used by selectors, components, middlewares, actions (VisualNode, ResolvedRelationship, utils, visualsRenderer, etc.). The published `@neo4j-arrows/graphics` surface is much smaller (only a few Visual* exports).
- **`src/selectors/`** – One rich `index.js` that composes model + graphics; the lib only has layers + inspection.

So you have two parallel “stacks”: **libs (TS, partial)** and **in-app copies (JS, full)**. The migration strategy must either (a) finish consolidating on libs and remove in-app copies, or (b) convert in-app JS to TS first and then optionally consolidate.

---

## 2. Dependency, Tooling, and API Considerations

### 2.1 Dependencies to Update or Replace

| Area | Current | Notes |
|------|--------|--------|
| **react-recompose** | ^0.33.0 | Unmaintained; used in `Keybindings.ts`, `GraphContainer.js` (compose, withProps). Plan: replace with hooks or small custom HOCs. |
| **React** | 18.2.0 | Keep; ensure types match (`@types/react` 18). |
| **Redux** | ^4.2.1 | Stable; consider `@reduxjs/toolkit` later for slices and better TS. |
| **Nx** | 16.2.2 | Can upgrade to 18/19 after TS migration stabilizes. |
| **Vite** | 4.3.7 | Can move to Vite 5. |
| **TypeScript** | 5.0.4 | Can move to 5.3+ for app and libs. |
| **ESLint** | ~8.15 + typescript-eslint 5.59 | Upgrade to typescript-eslint v6+ with flat config when moving off JS. |
| **Semantic UI** | semantic-ui-react 2.1.4 | Consider migration to a maintained UI set later (not blocking TS). |

### 2.2 Tooling

- **Strictness:** App tsconfig already has `strict: true`; keep it. Add `noImplicitAny` and gradually fix as files are converted.
- **allowJs:** Keep during migration; remove once no `.js`/`.jsx` remain in the app.
- **Paths:** `tsconfig.base.json` already has `@neo4j-arrows/*` for libs; use these as you switch the app to libs.
- **Tests:** Vitest already runs `.test.{js,ts,tsx}`; migrate test files when migrating the corresponding source.

### 2.3 API and Types

- **Redux state:** No single `RootState` type yet. Introduce it early (e.g. from `store.getState()`) and use in `connect` and selectors.
- **Neo4j driver / GraphQL:** Add or tighten types for driver results and GraphQL schema where they touch TS boundaries.
- **Window / globals:** `global.d.ts` already declares `react-recompose`; add any other globals (e.g. `__REDUX_DEVTOOLS_EXTENSION__`) there as needed.

---

## 3. Feature Interdependencies (DAG)

Rough dependency order for conversion (lower layers first so types flow upward):

```
1. Model (in-app)          → 2. State (ViewTransformation)
     ↓                           ↓
3. Graphics (in-app)       → 4. Selectors (in-app)
     ↓                           ↓
5. Storage (cypher, drive, export, neo4j)
     ↓
6. Reducers (depend on model, state, storage, actions)
     ↓
7. Actions (depend on model, graphics, storage)
     ↓
8. Middlewares
     ↓
9. Containers (Redux connect + recompose)
     ↓
10. Components (JSX) + main.tsx
```

**Cross-cutting:** GraphQL helpers, keybindings, and config are small and can be done early.

**Recommendation:** Prefer **inside-out** (model → graphics → selectors → storage → reducers → actions → middlewares → containers → components) so that each layer gets types before its consumers. The alternative (outside-in) would mean adding lots of `any` or loose types at the UI and fixing them later.

---

## 4. Recommended Direction: Inside-Out

**Why inside-out:**

1. **Types flow upward.** Once `model` and `graphics` are typed, selectors and reducers get correct types without guesswork.
2. **Lib consolidation fits naturally.** You can either (Option A) type the in-app `model`/`graphics` and then replace them with lib imports, or (Option B) extend the libs first and then switch the app to libs. Both are easier when the core is typed first.
3. **Fewer temporary `any`s.** Outside-in would type components first and push `any` into state/actions; cleaning that up is harder.
4. **Reducers and actions are the core of behavior.** Typing them (with a proper `RootState` and action types) gives the biggest benefit for refactors and new features.

**When to do a little “outside” work early:**

- Add **`RootState`** (and optionally a typed `AppDispatch`) once the reducer tree is fixed, and use them in a few key containers so the pattern is clear.
- Add **one or two component files** to TS (e.g. `Footer`, `EntityCounters`) to validate that props and Redux types work end-to-end.

---

## 5. Google Drive auth (do before or with Phase 0)

The app uses **deprecated Google auth** (`gapi.auth2`) for Google Drive sign-in and storage. Google recommends migrating to [Google Identity Services (GIS)](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis) and no longer maintains the old auth library.

**Recommendation:** Address this **before** starting the TypeScript migration (or as part of Phase 0) so you don’t type code that will then be replaced. See **[docs/GOOGLE_DRIVE_AUTH_MODERNIZATION.md](GOOGLE_DRIVE_AUTH_MODERNIZATION.md)** for current usage, what’s deprecated, and a step-by-step migration to GIS. After that, continue with Phase 0 (RootState, react-recompose) and the rest of the phases.

---

## 6. Branch Strategy: One Phase = One Branch

**Each phase is a separate branch.** Work in order: branch off `main`, do the phase, open a PR, merge to `main`. The next phase branches off the updated `main`. That way:

- Every merge leaves the app buildable and tests passing.
- No long-lived branch that drifts from `main`.
- Each PR has a clear, reviewable scope.

**Suggested branch names:** `modernize/phase-0-prep`, `modernize/phase-1-extend-libs`, `modernize/phase-2-wire-app-to-libs`, etc. (or `ts/phase-0-prep`, etc.).

**Merge criteria for every phase:** `nx run arrows-ts:build` and `nx run arrows-ts:test` pass; manual smoke test (or e2e) confirms the app still works.

**Dependency between phases:** Phases are *sequentially* dependent (Phase 2 branches off main after Phase 1 is merged, etc.), but each phase is *self-contained*: one branch, one PR, one clear scope. You do not do multiple phases on a single long-lived branch.

---

## 7. Incremental Plan (Phases = Branches) — Consolidate Libs First

The following is the **“consolidate libs first”** path. Each phase is intended to be one branch/PR.

---

### Phase 0 — Branch: Prep (RootState + remove react-recompose)

**Branch off:** `main`  
**Goal:** Typed store and no dependency on react-recompose so later phases can type containers cleanly.

**Scope:**

1. **RootState and store types**
   - Add a small `store.ts` (or next to `main.tsx`) that builds the store and exports `RootState` (e.g. `ReturnType<typeof store.getState>`) and `AppDispatch`.
   - Optionally add typed `useAppDispatch` / `useAppSelector` (or keep `connect` and type its args later).
2. **Replace react-recompose**
   - In `Keybindings.ts`: replace `withProps` with a small custom HOC or hooks.
   - In `GraphContainer.js`: replace `compose(...)(GraphDisplay)` with a single HOC or hook that composes connect + keybindings.
   - Remove `react-recompose` from `package.json` and delete `declare module 'react-recompose'` from `global.d.ts` once unused.

**Out of scope:** No changes to libs or to in-app model/graphics/selectors.

**Merge when:** Build + tests pass; app runs; no remaining imports of `react-recompose`.

---

### Phase 1 — Branch: Extend libs (model + graphics)

**Branch off:** `main` (after Phase 0 is merged).  
**Goal:** Libs export everything the app currently uses from in-app `model/` and `graphics/`, so the next branch can switch the app to libs only.

**Scope:**

1. **libs/model**
   - Add missing exports to `libs/model/src/index.ts`: `properties`, `labels`, `values`, `Size`, `gang`.
   - Add `relationshipBundling` (e.g. under `libs/model/src/lib/graph/` or equivalent) and export it.
   - Ensure the lib already exports everything the app’s `src/model/` and `src/selectors/` use (Point, Graph, styling, selection, guides, etc.). Add any missing pieces.
   - Run `libs/model` tests; fix or add tests for new exports.
2. **libs/graphics**
   - Add and export everything the app imports from `src/graphics/`: e.g. `ResolvedRelationship`, `TransformationHandles`, `RoutedRelationshipBundle`, `CanvasAdaptor`, `relationshipAttachment`, `BackgroundImage`, `visualsRenderer`, `NodeCaptionFillNode`, `NodeCaptionOutsideNode`, `RelationshipType`, `ComponentStack`, `circumferentialTextAlignment`, and all of `graphics/utils/` and `graphics/constants`.
   - Either move/copy from `apps/arrows-ts/src/graphics/` into the lib (as TS) or add thin re-exports if some code already exists in the lib. Prefer a single source of truth in the lib.
   - Run `libs/graphics` tests; add tests where needed.

**Out of scope:** No changes to `apps/arrows-ts` in this branch (no import path changes, no file deletions). App still uses in-app `model/` and `graphics/`.

**Merge when:** All lib builds and lib tests pass; app still builds (it still uses in-app copies).

---

### Phase 2 — Branch: Wire app to libs (delete in-app model & graphics)

**Branch off:** `main` (after Phase 1 is merged).  
**Goal:** App imports model and graphics only from `@neo4j-arrows/model` and `@neo4j-arrows/graphics`; remove in-app copies.

**Scope:**

1. **Switch imports**
   - In `apps/arrows-ts/src`, replace every `from '../model/...'` and `from '../graphics/...'` (and similar relative paths) with `@neo4j-arrows/model` and `@neo4j-arrows/graphics`. Fix any export name differences.
2. **Selectors**
   - Update `src/selectors/*` to import from the libs. If `libs/selectors` is missing selectors that live in `apps/arrows-ts/src/selectors/index.js`, either add those selectors to `libs/selectors` and export them, or keep a single in-app `selectors` layer that only imports from the two libs (no local model/graphics).
3. **State**
   - Convert `src/state/ViewTransformation.js` to `.ts` if the lib doesn’t already provide it, or remove it and use the lib’s `ViewTransformation`.
4. **Delete in-app copies**
   - Remove `apps/arrows-ts/src/model/` and `apps/arrows-ts/src/graphics/` entirely.
5. **Fix references**
   - Fix any remaining references to `../model/` or `../graphics/` (e.g. in tests or config).

**Merge when:** Build + tests pass; app runs; no `src/model` or `src/graphics` directories; all model/graphics usage is from libs.

---

### Phase 3 — Branch: Selectors and storage to TypeScript

**Branch off:** `main` (after Phase 2 is merged).  
**Goal:** Selectors and storage layer are TypeScript and typed.

**Scope:**

1. Convert `apps/arrows-ts/src/selectors/*.js` → `.ts` (they now depend only on libs).
2. Convert `apps/arrows-ts/src/storage/*.js` → `.ts` (except any already `.ts`). Add types for file formats and Neo4j payloads where useful.
3. Align `neo4jStorage.ts` types with the rest of storage if needed.

**Merge when:** Build + tests pass; selectors and storage are TS.

---

### Phase 4 — Branch: Reducers and actions to TypeScript

**Branch off:** `main` (after Phase 3 is merged).  
**Goal:** All reducers and actions are TypeScript and use `RootState` / action types.

**Scope:**

1. Convert all `reducers/*.js` → `.ts`; use `RootState` and action types (e.g. inferred from action creators).
2. Convert all `actions/*.js` → `.ts`; use proper event types where relevant (clipboard, drag, etc.).

**Merge when:** Build + tests pass; reducers and actions are TS.

---

### Phase 5 — Branch: Middlewares and containers to TypeScript

**Branch off:** `main` (after Phase 4 is merged).  
**Goal:** Middlewares and containers are TypeScript with typed Redux.

**Scope:**

1. Convert `middlewares/*.js` → `.ts`.
2. Convert `containers/*.js`/`.jsx` → `.ts`/`.tsx`; use typed `mapStateToProps`/`mapDispatchToProps` (or typed hooks) with `RootState` and `AppDispatch`.

**Merge when:** Build + tests pass; middlewares and containers are TS/TSX.

---

### Phase 6 — Branch: Components and entry to TypeScript

**Branch off:** `main` (after Phase 5 is merged).  
**Goal:** All UI and entry points are TypeScript.

**Scope:**

1. Convert all `components/**/*.jsx` → `.tsx` (and any `.js` in components).
2. Convert `registerServiceWorker.js` → `.ts`.
3. Ensure `main.tsx` and `App.tsx` are fully typed (minimize `any` and globals).

**Merge when:** Build + tests pass; no remaining `.jsx`/`.js` in the app source (except possibly tests).

---

### Phase 7 — Branch: Cleanup and hardening

**Branch off:** `main` (after Phase 6 is merged).  
**Goal:** Strict TS-only app; test files migrated; optional tooling bumps.

**Scope:**

1. Remove `allowJs` from app tsconfig; remove `**/*.js`/`**/*.jsx` from `include` if present.
2. Migrate remaining `.test.js`/`.spec.js` to `.test.ts`/`.tsx` in app and libs.
3. Decide fate of `arrows-app` (deprecate or migrate later).
4. Optionally bump TypeScript, ESLint, Nx in a later PR.

**Merge when:** Build + tests + e2e pass; app is TS-only (except any intentional exclusions).

---

## 8. Dependency Update Order (Suggested)

1. **During migration:** Keep current major versions to avoid churn. Fix type errors and tests as you convert.
2. **After app is fully TS:**  
   - TypeScript 5.0 → 5.3+  
   - typescript-eslint 5 → 6+ (and move to flat config if desired)  
   - Vite 4 → 5  
   - Nx 16 → 18 or 19 (follow Nx upgrade guides)
3. **Optional later:** Redux Toolkit, React 19 when stable, and UI library refresh.

---

## 9. Risk Mitigation

- **One slice at a time:** Convert one reducer + its actions + selectors + connected components together so you can run the app and tests after each slice.
- **Tests:** Run `nx run arrows-ts:test` and e2e after each phase (or each PR). Migrate tests when you migrate the module.
- **Branch strategy:** Prefer short-lived branches per phase or per feature area; keep `main` buildable and green.
- **Lib surface:** If you extend libs (Option A), add unit tests for new exports and ensure `libs/model` and `libs/graphics` build and test in CI.

---

## 10. Quick Reference: File Counts (Approximate)

| Layer           | JS/JSX files (arrows-ts) | Notes                          |
|----------------|---------------------------|--------------------------------|
| model (in-app) | ~25                       | Remove if consolidating to lib |
| graphics (in-app) | ~50+                   | Remove if consolidating to lib |
| selectors      | 4                         |                                |
| state          | 1                         | ViewTransformation             |
| storage        | 8                         |                                |
| reducers       | 18                        |                                |
| actions        | ~19                       | 2 already .ts                  |
| middlewares    | 5                         |                                |
| graphql        | ~10                       |                                |
| containers     | ~10                       |                                |
| components     | ~40                       |                                |
| Other          | a few                     | registerServiceWorker, etc.    |

Total: on the order of **~200+ app source files** to convert (excluding duplicates in `arrows-app`). Phasing and inside-out order should make this manageable without big-bang rewrites.
