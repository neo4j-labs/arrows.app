# Implementation Plan: Google Drive Auth Modernization

**Branch**: `001-google-drive-auth-migration` | **Date**: 2025-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-google-drive-auth-migration/spec.md`

## Summary

Replace deprecated `gapi.auth2` with **Google Identity Services (GIS)** for obtaining the access token used by Drive API v3, Picker, and (after replacement) sharing. Drive v3 and Picker remain unchanged; only the auth source and app-managed "authorized" state change. Share is replaced with Drive API v3 permissions + copy-link UI where `gapi.drive.share.ShareClient` is deprecated.

## Technical Context

**Language/Version**: TypeScript 5.0.4 (app `arrows-ts`); some modules still .js (e.g. googleDrive, reducers).  
**Primary Dependencies**: React 18.2, Redux 4.2, Nx 16.2, Vite 4.3; Google Identity Services (GIS) script for auth; Drive API v3 REST; Google Picker.  
**Storage**: N/A (browser-only; token and authorized state in Redux / in-memory; no server persistence).  
**Testing**: Vitest 0.31, Cypress 12 (e2e); unit tests for model/graphics.  
**Target Platform**: Web; modern browsers (same as current app).  
**Project Type**: web-app (Nx monorepo: `apps/arrows-ts`, `apps/arrows-app`, `libs/`).  
**Performance Goals**: Open diagram from Drive &lt;60s (SC-001); save success ≥95% (SC-002).  
**Constraints**: Auth only on user gesture (FR-002); single token for all Drive operations (FR-003); clear authorized state on 401/expiry and allow re-authorize (FR-004, FR-005).  
**Scale/Scope**: Single-user SPA; ~10+ files touching Google Drive (actions, storage, reducers, picker, share, modal, config).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|------------------------|--------|--------|
| **I. Drawing-Only Purpose** | ✅ Pass | Drive is storage for diagram files only; no DB exploration or semantic viz. |
| **II. Neo4j Property Graph Model** | ✅ Pass | No change to editor/export model; Drive is transport only. |
| **III. Dependency-Free Rendering Core** | ✅ Pass | Auth and Drive live in app layer (actions, storage, components); rendering core untouched. |
| **IV. User-Controlled Layout and Styling** | ✅ Pass | No layout or styling changes. |
| **V. Export and Portability** | ✅ Pass | Export formats unchanged; Drive is one storage target. |
| **Stack (React 18, Redux, TypeScript, Nx, Vite)** | ✅ Pass | No stack change. |
| **License (Apache 2.0)** | ✅ Pass | N/A for this feature. |
| **No direct database connection** | ✅ Pass | Drive is external storage; no Neo4j connection change. |
| **Platform: Web, modern browsers** | ✅ Pass | Same. |
| **Spec-driven work; Constitution Check in plans** | ✅ Pass | This plan and spec used. |

**Gate result**: **PASS** — No violations. Complexity Tracking table left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-google-drive-auth-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
apps/arrows-ts/
├── index.html                    # Scripts: add GSI client; later remove or keep api.js per research
├── src/
│   ├── actions/
│   │   └── googleDrive.js        # init, signIn, saveFile, rename → GIS token + Drive v3
│   ├── storage/
│   │   └── googleDriveStorage.js # fetchGraphFromDrive; token from state
│   ├── reducers/
│   │   └── googleDrive.js       # signedIn / apiInitialized → token-based state
│   ├── components/
│   │   ├── GoogleDrivePickerWrapper.js  # Picker + setOAuthToken(GIS token)
│   │   ├── GoogleDriveShareWrapper.js  # Replace ShareClient with permissions + copy link
│   │   └── editors/
│   │       └── GoogleSignInModal.jsx   # Authorize → requestAccessToken()
│   └── config.ts                # clientId, apiKey, appId (unchanged)
libs/                            # No change for this feature
apps/arrows-app/                 # Legacy app; same auth migration if maintained
```

**Structure Decision**: Single Nx monorepo; Google Drive code lives under `apps/arrows-ts` (and `arrows-app` if kept). No new top-level packages; optional new module e.g. `googleDriveAuth.js` or `googleAuth.ts` under `apps/arrows-ts/src` for GIS token client only.

## Complexity Tracking

> No Constitution violations. Table not used.
