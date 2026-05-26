# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Arrows.app is a web-based tool for drawing pictures of Neo4j property graphs (nodes, relationships, properties, labels) for export as image or Cypher. It is an Nx-managed monorepo of a React + Redux app plus dependency-free Canvas/SVG graph rendering libraries.

## Monorepo layout

Nx workspace (Nx 16, npm). Build/test/lint targets are defined in each project's `project.json`.

- `apps/arrows-ts/` — primary React + Redux application (Vite). This is the app that is built and served. Entry: `src/main.tsx`. Contains `actions/`, `reducers/`, `middlewares/`, `containers/`, `components/`, `interactions/`, `storage/`, `graphics/`, plus Google Drive auth glue (`googleDriveAuth.js`, `googleDriveConstants.js`).
- `apps/arrows-app/` — secondary app shell (smaller scaffolding). Most active work happens in `arrows-ts`.
- `apps/arrows-ts-e2e/` — Cypress e2e tests for `arrows-ts`.
- `libs/model/` — pure-TS domain model for graphs (nodes, relationships, properties, styling, geometry).
- `libs/graphics/` — dependency-free rendering primitives (Canvas + SVG) consumed by the app.
- `libs/selectors/` — Reselect selectors over Redux state.

The `arrows-ts` app also duplicates some `model/`, `graphics/`, `selectors/` directories under `apps/arrows-ts/src/` — when modifying behavior, check whether the canonical version lives in `libs/` and prefer editing there.

## Architecture

- **State**: Redux store with `redux-thunk` and `redux-undo`. Actions in `apps/arrows-ts/src/actions/` are dispatched from interaction handlers; reducers in `reducers/` produce immutable graph state; selectors in `libs/selectors/` derive view data.
- **Rendering**: The graph is drawn imperatively to Canvas via `libs/graphics/`. SVG export goes through the same primitives. React renders the surrounding chrome (toolbars, dialogs, side panels) using `semantic-ui-react`.
- **Interactions**: Pointer/keyboard handlers live in `apps/arrows-ts/src/interactions/` and translate raw events into Redux actions (drag, marquee select, connect, etc.).
- **Persistence**: Storage adapters in `apps/arrows-ts/src/storage/` handle local storage, Google Drive (auth via Google Identity Services — see PR #138 / `googleDriveAuth.js`), and Neo4j-database-backed storage (mostly disabled).
- **Export**: Cypher generation and image export are driven from `actions/` using the shared `libs/model` types so the same diagram drives both render and export paths.

## Commands

Install: `npm install`

Run via Nx directly (preferred):

- Dev server: `npx nx serve arrows-ts` → http://localhost:4200
- Build: `npx nx build arrows-ts` (or `npm run build`)
- Unit tests (Vitest): `npx nx test arrows-ts`
  - Single file: `npx nx test arrows-ts -- path/to/file.spec.ts`
  - Single test by name: `npx nx test arrows-ts -- -t "test name"`
- Lint: `npx nx lint arrows-ts`
- E2E (Cypress): `npx nx e2e arrows-ts-e2e`
- Test/lint a lib: `npx nx test model`, `npx nx lint graphics`, etc.
- Affected only: `npx nx affected -t test` / `npx nx affected -t lint`
- Dep graph: `npx nx graph`

Note: the README mentions `nx serve arrows-app`, but `arrows-ts` is the actively developed app and is what `npm run build` targets.

## Deployment

GCP App Engine. See `DEPLOYMENT.md` for the publishing workflow, required GCP project setup, API key, and Secret Manager configuration. Configs: `app.yaml` (prod), `app.staging.yaml` (staging), `cloudbuild.yaml`.

## Conventions

- TypeScript with path aliases from `tsconfig.base.json` (`@neo4j-arrows/model`, `@neo4j-arrows/graphics`, `@neo4j-arrows/selectors`). Use these aliases instead of relative paths across project boundaries.
- Prettier + ESLint (`eslint-config-react-app`, `@nx/eslint-plugin`). Run lint before committing.
- Redux state is treated as immutable — never mutate; produce new objects/arrays in reducers and actions.
- New rendering/model logic should land in `libs/`, not under `apps/arrows-ts/src/`, so it stays reusable.
