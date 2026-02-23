# Feature Specification: Google Drive Auth Modernization

**Feature Branch**: `001-google-drive-auth-migration`  
**Created**: 2025-02-23  
**Status**: Draft  
**Input**: User description: "migrate the google drive auth to the latest supported API because the Arrows.app is currently using a deprecated API. See proposals/GOOGLE_DRIVE_AUTH_MODERNIZATION.md for details"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authorize app to access Google Drive (Priority: P1)

A user who wants to open or save diagrams from Google Drive can grant the app permission to access their Drive. They trigger authorization (e.g. via an "Authorize" or "Sign in with Google" action), complete the identity provider’s consent flow in the browser, and the app then treats them as authorized for Drive operations until the session or token is no longer valid.

**Why this priority**: Authorization is the gate for all Drive features; without it, open/save/picker cannot work.

**Independent Test**: Can be fully tested by triggering the authorize action, completing consent, and confirming the app shows an authorized state and can perform at least one Drive operation (e.g. list or open a file).

**Acceptance Scenarios**:

1. **Given** the user is not yet authorized, **When** the user chooses to authorize for Google Drive, **Then** the app presents the identity provider’s consent flow and, after successful consent, the user is treated as authorized.
2. **Given** the user has already authorized, **When** the user opens the app or returns to it, **Then** the app reflects authorized state when a valid session/token exists without forcing re-consent unnecessarily.
3. **Given** the user starts the authorize flow, **When** the user cancels or denies consent, **Then** the app does not treat the user as authorized and does not perform Drive operations on their behalf.

---

### User Story 2 - Open, save, and rename diagrams in Google Drive (Priority: P2)

A user who has authorized the app can open an existing diagram from Google Drive, save the current diagram to Drive (new or overwrite), and rename a file stored in Drive. All of these actions use the same authorization and must work without relying on deprecated auth interfaces.

**Why this priority**: Core value of the integration is reading and writing diagrams to the user’s Drive.

**Independent Test**: Can be tested by authorizing, then performing open (from Drive), save (new file and overwrite), and rename; all succeed and persist correctly in Drive.

**Acceptance Scenarios**:

1. **Given** the user is authorized, **When** the user chooses to open a diagram from Google Drive and selects a file, **Then** the diagram loads and is displayed.
2. **Given** the user is authorized and has a diagram open, **When** the user saves to Google Drive (new or existing file), **Then** the file is created or updated in Drive and the user receives clear success feedback.
3. **Given** the user is authorized and has a file in Drive, **When** the user renames that file from within the app, **Then** the file name is updated in Drive and the app state reflects the new name.

---

### User Story 3 - Pick files from Google Drive (Priority: P3)

A user who has authorized the app can use a file picker to browse and select files from their Google Drive (e.g. to open a diagram). The picker uses the same authorization as the rest of the app and does not depend on deprecated auth.

**Why this priority**: Picker improves discoverability and choice of files; depends on P1 and aligns with P2.

**Independent Test**: Can be tested by authorizing, opening the picker, selecting a Drive file, and confirming the app receives and can open that file.

**Acceptance Scenarios**:

1. **Given** the user is authorized, **When** the user opens the Google Drive file picker, **Then** they can browse their Drive and select a file.
2. **Given** the user has selected a file in the picker, **When** they confirm the selection, **Then** the app receives the chosen file and can open or use it (e.g. load diagram).

---

### User Story 4 - Share or copy link for Drive files (Priority: P4)

A user who has saved a diagram to Google Drive can share it or obtain a link (e.g. copy link, or manage sharing). The exact behavior may be a simple "copy link" and/or a share dialog, using supported mechanisms rather than deprecated sharing APIs.

**Why this priority**: Sharing is a common follow-up to saving; can be delivered after core open/save/picker.

**Independent Test**: Can be tested by saving a file to Drive, then using the share/copy-link action and verifying the link or sharing behavior works as intended.

**Acceptance Scenarios**:

1. **Given** the user is authorized and has a file in Drive, **When** the user chooses to share or copy link, **Then** they can obtain a shareable link or complete a share action using supported behavior.
2. **Given** the user has obtained a link, **When** another user (with access) opens it, **Then** the file is accessible as expected (within Drive permissions).

---

### Edge Cases

- What happens when the access token expires or is revoked during a session?  
  The app must detect invalid or expired authorization (e.g. via 401 or equivalent) and stop treating the user as authorized; the user must be able to trigger authorization again (e.g. "Authorize" or "Sign in") to obtain a new token without leaving the page.

- What happens when the user has multiple tabs open?  
  Authorization state should be consistent enough that Drive operations in the app tab work; re-authorization in one tab may or may not automatically reflect in others (acceptable to require refresh or re-authorize in the other tab).

- What happens when the user denies or revokes consent in the identity provider?  
  The app must no longer perform Drive operations with the old token and must prompt for authorization again when the user next attempts a Drive action.

- What happens when the user is offline or the identity provider is unavailable?  
  The app should show a clear, user-friendly message and not treat the user as authorized until they can complete the flow; previously opened content may remain viewable depending on product policy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST obtain access to the user’s Google Drive only through a supported, non-deprecated identity and authorization flow provided by the same identity provider (Google).
- **FR-002**: The system MUST request authorization (and thus token issuance) only in response to a user gesture (e.g. click on "Authorize" or "Open from Drive"); it MUST NOT auto-trigger full consent in the background without user action.
- **FR-003**: The system MUST use a single authorization outcome (e.g. access token) to perform all Google Drive operations: open file, save file, rename file, file picker, and share/copy link.
- **FR-004**: The system MUST represent "authorized for Drive" state based on having a valid access token (or equivalent) and MUST clear or update this state when the token is invalid, expired, or revoked (e.g. after 401 or explicit sign-out).
- **FR-005**: The system MUST, when any Drive-related request fails due to invalid or expired authorization, stop using the old token and allow the user to re-authorize (e.g. via the same authorize action) to obtain a new token.
- **FR-006**: The system MUST support the same scope of Drive access as before (e.g. per-file access for files the app creates or opens, and "Open with" / "New" in Drive UI where applicable), without broadening permissions beyond what is necessary.
- **FR-007**: The system MUST remove or replace all use of deprecated auth APIs for Google Drive so that the product relies only on supported auth and Drive interfaces.
- **FR-008**: Users MUST be able to explicitly revoke or sign out from Google Drive access from within the app, and the app MUST then stop performing Drive operations until the user authorizes again.

### Key Entities

- **Access token (or equivalent)**: The credential obtained after user consent, used to call Drive and Picker; short-lived; must be refreshed or re-requested when invalid or expired.
- **Authorized state**: Boolean or equivalent indicating whether the app currently has a valid token and can perform Drive operations; drives UI (e.g. "Authorize" vs "Signed in") and eligibility for open/save/picker/share.
- **Drive file (diagram)**: A file in the user’s Google Drive that the app can open, save, rename, or share; identified by provider file id and optional name; access is governed by the same token and scopes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete authorization and open a diagram from Google Drive in under 60 seconds (from click to diagram loaded), under normal network conditions.
- **SC-002**: After authorization, users can save a diagram to Google Drive and see success confirmation without errors in at least 95% of attempts under normal conditions.
- **SC-003**: The application no longer depends on any deprecated Google auth APIs for Drive; all Drive and Picker operations use the same supported authorization mechanism.
- **SC-004**: When the token expires or is revoked, the user can re-authorize with one explicit action (e.g. one click to "Authorize") and subsequently perform Drive operations again without restarting the app.
- **SC-005**: Zero increase in authorization-related support issues (e.g. "can’t open from Drive", "save failed") attributable to the migration, when compared to a baseline period before release.

## Assumptions

- The existing product already supports Google Drive open, save, rename, picker, and some form of share; the change is limited to replacing the auth mechanism and any minimal adjustments to how the token is passed into existing flows.
- "Supported" auth means the identity provider’s current, non-deprecated web flow (e.g. token or code flow) as documented in their official migration guidance.
- Drive API and Picker endpoints or behaviors that are still supported will be retained; only the source of the access token changes.
- Share/copy-link may be implemented as a simple "copy link" plus optional permissions UI using supported APIs, rather than replicating a legacy share dialog exactly.
- Session and token handling (e.g. in-memory vs short-lived persistence) follow the same security and UX constraints as the rest of the web app (no sensitive tokens in URLs or public storage).
