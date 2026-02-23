# Tasks: Google Drive Auth Modernization

**Input**: Design documents from `/specs/001-google-drive-auth-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature specification; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Nx monorepo)**: `apps/arrows-ts/` for main app; paths relative to repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add GIS script and verify Google config so the auth stack can be initialized.

- [X] T001 Add Google Identity Services script to `apps/arrows-ts/index.html`: `<script src="https://accounts.google.com/gsi/client" async defer></script>`
- [X] T002 [P] Verify `apps/arrows-ts/src/config.ts` exposes `clientId`, `apiKey`, and `appId` for Google (no new env vars required per research.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: GIS token client, Redux state for token/authorized state, init flow without gapi.auth2, and 401 handling. All user stories depend on this.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create GIS token client module in `apps/arrows-ts/src/googleDriveAuth.js` (or `googleAuth.ts`): `initTokenClient(clientId, scopes, callback)`, `requestAccessToken()` on user gesture, `getAccessToken()` (from Redux or callback), `signOut()` clearing token and optionally calling `google.accounts.oauth2.revoke`; use existing SCOPES and clientId from config
- [X] T004 Add `accessToken` and `expiresAt` (optional) to `apps/arrows-ts/src/reducers/googleDrive.js`; add action types and handlers for setting token and clearing token (clear on sign-out and on 401); keep `signedIn` and `apiInitialized`; derive `signedIn` from presence of valid token
- [X] T005 Rewrite `initGoogleDriveApi` in `apps/arrows-ts/src/actions/googleDrive.js`: remove `gapi.load('client:auth2:...')` and `isSignedIn.listen`/`get`; initialize GIS token client (from googleDriveAuth module); keep loading gapi for Picker/Drive upload if needed; set `apiInitialized` true when ready; do not request token or open consent in init
- [X] T006 Add a Redux action (e.g. `clearGoogleDriveToken` or reuse sign-out) in `apps/arrows-ts/src/actions/googleDrive.js` and ensure all future Drive/Picker call sites can dispatch it on 401; document in code that any Drive or Picker request returning 401 must clear token and set signedIn false

**Checkpoint**: Foundation ready — token client exists, Redux holds token/authorized state, init uses GIS only; user story implementation can begin.

---

## Phase 3: User Story 1 – Authorize app to access Google Drive (Priority: P1) 🎯 MVP

**Goal**: User can trigger authorization via "Authorize" or "Sign in with Google", complete consent, and the app treats them as authorized until token is invalid; cancel/deny does not authorize; user can sign out.

**Independent Test**: Trigger authorize action, complete consent, confirm app shows authorized state and can perform at least one Drive operation (e.g. list or open a file); cancel flow and confirm not authorized; sign out and confirm Drive operations disabled until re-authorize.

### Implementation for User Story 1

- [X] T007 [US1] In `apps/arrows-ts/src/components/editors/GoogleSignInModal.jsx`, replace `gapi.auth2.getAuthInstance().signIn()` with the new `requestAccessToken()` (from googleDriveAuth) on Authorize button click; ensure call is in response to user gesture only
- [X] T008 [US1] Wire app bootstrap so `initGoogleDriveApi(store)` is called and sets `apiInitialized` when GIS token client is ready in `apps/arrows-ts/src/main.tsx` or `apps/arrows-ts/src/app/App.tsx`; ensure "Authorize" button is enabled only when `apiInitialized` and show "Signed in" when `signedIn` (from Redux state) in `apps/arrows-ts/src/components/editors/GoogleSignInModal.jsx`
- [X] T009 [US1] Expose sign-out in `apps/arrows-ts/src/components/editors/GoogleSignInModal.jsx` or application menu: call `signOut()` from googleDriveAuth when user chooses to revoke/sign out from Google Drive; ensure UI reflects signed-out state and Drive actions are disabled until user authorizes again
- [X] T010 [US1] Ensure any other entry points that previously called `gapi.auth2.getAuthInstance().signIn()` now call the new `requestAccessToken()` instead; verify no gapi.auth2 or gapi.auth.getToken() remain in auth flow in `apps/arrows-ts/src`

**Checkpoint**: User Story 1 complete — authorization and sign-out work; app state reflects authorized/not authorized; no gapi.auth2 in auth path.

---

## Phase 4: User Story 2 – Open, save, and rename diagrams in Google Drive (Priority: P2)

**Goal**: Authorized user can open a diagram from Drive, save (new or overwrite), and rename a file in Drive; all use the same GIS token and no deprecated auth.

**Independent Test**: After authorizing, open a diagram from Drive, save (new file and overwrite), rename a file; verify persistence in Drive and success feedback.

### Implementation for User Story 2

- [X] T011 [US2] In `apps/arrows-ts/src/storage/googleDriveStorage.js`, replace `window.gapi.auth.getToken().access_token` with token from Redux state (selector or passed from caller); use `Authorization: Bearer <token>` for Drive v3 requests; on 401 response, dispatch clear token and set signedIn false
- [X] T012 [US2] In `apps/arrows-ts/src/actions/googleDrive.js`, update `saveFile` to use access token from Redux (or set token on gapi client when using gapi.client.request); on 401 or auth error, dispatch clear token and set signedIn false
- [X] T013 [US2] In `apps/arrows-ts/src/actions/googleDrive.js`, update `renameGoogleDriveStore` to use access token from Redux (or gapi client configured with token); on 401 or auth error, dispatch clear token and set signedIn false
- [X] T014 [US2] Ensure all callers of `fetchGraphFromDrive`, `saveFile`, and `renameGoogleDriveStore` pass or have access to token from state (e.g. via getAccessToken or Redux selector); verify open, save, and rename flows work with GIS token only in `apps/arrows-ts/src`

**Checkpoint**: User Story 2 complete — open, save, and rename use GIS token; 401 clears auth state.

---

## Phase 5: User Story 3 – Pick files from Google Drive (Priority: P3)

**Goal**: Authorized user can open the file picker, browse Drive, select a file, and the app receives it; picker uses GIS token only.

**Independent Test**: After authorizing, open Google Drive file picker, select a file, confirm app receives and can open it.

### Implementation for User Story 3

- [X] T015 [P] [US3] In `apps/arrows-ts/src/components/GoogleDrivePickerWrapper.js`, replace token from `window.gapi.auth.getToken().access_token` with token from Redux state (or getAccessToken()); call `setOAuthToken(accessToken)` with that token when building the Picker; remove any use of `gapi.auth2` or `gapi.auth.getToken()` in this file

**Checkpoint**: User Story 3 complete — Picker uses GIS token; file selection works.

---

## Phase 6: User Story 4 – Share or copy link for Drive files (Priority: P4)

**Goal**: Authorized user with a file in Drive can obtain a shareable link or complete a share action using Drive API v3 (no ShareClient).

**Independent Test**: Save a file to Drive, use share/copy-link action, verify link or sharing behavior works; another user with access can open the link.

### Implementation for User Story 4

- [X] T016 [US4] In `apps/arrows-ts/src/components/GoogleDriveShareWrapper.js`, remove use of `gapi.drive.share.ShareClient` and `gapi.auth2`/`gapi.auth.getToken()`; implement "Copy link" (and optional share UI) using Drive API v3 (e.g. get file metadata for webViewLink, or create permission); use access token from Redux state for all API calls; on 401, dispatch clear token and set signedIn false
- [X] T017 [US4] Wire share/copy-link UI to the new implementation in `apps/arrows-ts/src/components/GoogleDriveShareWrapper.js`; ensure only authorized users with a Drive file can use the action

**Checkpoint**: User Story 4 complete — share/copy link uses supported APIs and GIS token.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Remove deprecated usage and optional cleanup; validate with quickstart.

- [X] T018 [P] Remove all remaining references to `gapi.auth2` and `gapi.auth.getToken()` from `apps/arrows-ts/src` (search actions, storage, components, reducers); ensure no code path uses deprecated auth
- [X] T019 If `api.js` is no longer required (e.g. all Drive calls use fetch and Picker loads another way), remove `<script src="https://apis.google.com/js/api.js"></script>` from `apps/arrows-ts/index.html`; otherwise leave api.js and only ensure auth2 is unused (per research.md)
- [X] T020 Run validation from `specs/001-google-drive-auth-migration/quickstart.md` (authorization, open/save/rename, picker, 401, sign-out) and fix any regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phase 3–6)**: All depend on Foundational completion.
  - US1 (Phase 3) must be done first so "authorized" state and token exist.
  - US2, US3, US4 can proceed after US1 (they consume token from state).
  - US2 and US3 can be done in parallel; US4 can follow or run in parallel after US1.
- **Polish (Phase 7)**: Depends on all user stories that are in scope.

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no other story dependency; delivers auth and token in state.
- **User Story 2 (P2)**: After Foundational and US1 — uses token from state for Drive open/save/rename.
- **User Story 3 (P3)**: After Foundational and US1 — uses token from state for Picker.
- **User Story 4 (P4)**: After Foundational and US1 — uses token from state for share/copy link; can follow US2 (share is used after save).

### Within Each User Story

- Implementation tasks in order shown; T007–T010 for US1; T011–T014 for US2; T015 for US3; T016–T017 for US4.

### Parallel Opportunities

- Phase 1: T002 is [P] with T001.
- Phase 2: T003 is [P]; T004, T005, T006 are sequential (reducer then actions that use it).
- Phase 5: T015 is [P] within US3.
- Phase 7: T018 is [P]; T019 and T020 can follow.

---

## Parallel Example: User Story 2

```text
# After US1 and Foundational are done, US2 tasks are largely sequential (same files).
# T011 (storage) can be done first; then T012, T013 (actions); then T014 (integration check).
```

## Parallel Example: User Story 3

```text
# Single task T015 — can run as soon as Foundational + US1 are done.
Task: "In GoogleDrivePickerWrapper.js, use token from Redux, setOAuthToken(accessToken), remove gapi.auth"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (required for all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Trigger authorize, complete consent, confirm signedIn and one Drive operation; test sign-out and re-authorize.
5. Deploy/demo if ready.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → test independently → MVP (auth works).
3. Add User Story 2 → test open/save/rename → deliver.
4. Add User Story 3 → test picker → deliver.
5. Add User Story 4 → test share/copy link → deliver.
6. Polish → remove deprecated refs, validate quickstart.

### Parallel Team Strategy

- Complete Setup + Foundational together.
- After that: one developer can do US1; once US1 is done, US2 and US3 can be split (US2 storage/actions, US3 picker); US4 can follow US2 or run in parallel with US3.

---

## Notes

- [P] tasks = different files or no dependency on same-phase tasks.
- [Story] label maps task to user story for traceability.
- Each user story is independently testable per spec "Independent Test".
- All paths are relative to repository root; primary app is `apps/arrows-ts/`.
- Commit after each task or logical group; stop at checkpoints to validate.
