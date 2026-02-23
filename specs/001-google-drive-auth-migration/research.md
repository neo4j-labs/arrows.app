# Research: Google Drive Auth Modernization

**Branch**: `001-google-drive-auth-migration` | **Phase**: 0

## 1. Auth: Google Identity Services (GIS) token model

**Decision**: Use **Google Identity Services** with the **token model (implicit flow)** for obtaining the access token. Load `https://accounts.google.com/gsi/client`; initialize via `google.accounts.oauth2.initTokenClient({ client_id, scope, callback })` and request token on user gesture with `tokenClient.requestAccessToken()`.

**Rationale**: Official migration path from deprecated `gapi.auth2`; GIS does not provide a persistent "signed in" session—the app must derive "authorized" from possession of a valid access token and clear it on 401/expiry or explicit sign-out (aligns with FR-004, FR-005).

**Alternatives considered**: Keeping gapi.auth2 (rejected: deprecated). Using OAuth 2.0 authorization code flow with a backend (rejected: app is client-only; spec requires no new server).

---

## 2. Token storage and lifecycle

**Decision**: Store the access token (and optionally expiry time) in Redux state. "Authorized" = we have a token and have not yet seen 401/expiry or explicit sign-out. On any Drive/Picker request returning 401, clear token and set authorized to false; user must trigger "Authorize" again (user gesture) to call `requestAccessToken()`. Optionally call `google.accounts.oauth2.revoke(access_token)` on explicit sign-out.

**Rationale**: FR-002 requires auth only on user gesture; FR-004/FR-005 require clearing state on invalid/expired token and allowing re-authorize. Storing expiry is optional because 401 from the API is the authoritative signal; pre-emptive refresh would require either a background timer (not a user gesture) or checking expiry only at request time—simplest is to rely on 401 and re-request on next gesture.

**Alternatives considered**: Proactive refresh with a timer (rejected: would need to run without user gesture for UX, conflicting with FR-002). Storing token only in a closure (rejected: need to share token with storage, picker, share and to clear on 401 from any caller).

---

## 3. Drive Share: replace ShareClient

**Decision**: Replace `gapi.drive.share.ShareClient` with **Drive API v3 permissions** and a simple **copy link** (and optional share UI). Use Drive API endpoints for permissions (e.g. create permission, get file metadata for webViewLink) and present "Copy link" and optionally a minimal permissions control in the app.

**Rationale**: ShareClient is part of the legacy gapi stack; Google’s current guidance is to use the Drive API for sharing. Spec (FR-007, User Story 4) allows "copy link" and/or share dialog using supported mechanisms.

**Alternatives considered**: Keeping ShareClient (rejected: legacy, may break). Third-party share UI library (rejected: unnecessary; Drive API is sufficient for copy link + permissions).

---

## 4. Script loading: api.js vs fetch for Drive

**Decision**: **Keep `api.js`** for (1) **Google Picker** (PickerBuilder, etc.) and (2) optionally for **Drive multipart upload** (`gapi.client.request` for upload/drive/v3/files) until a follow-up refactor. Add `<script src="https://accounts.google.com/gsi/client" async defer></script>` for GIS. Use the **same GIS token** for Picker (`setOAuthToken(accessToken)`) and for any Drive call (either via gapi client or via `fetch` + `Authorization: Bearer <token>`).

**Rationale**: Picker is documented to work with token from GIS. Drive v3 can be called with `fetch` + Bearer token; current save uses `gapi.client.request` with multipart body—migration can first switch only the token source to GIS and leave upload path as-is to reduce risk; a later change can replace upload with `fetch` and then remove api.js if nothing else needs it.

**Alternatives considered**: Remove api.js and use only fetch for Drive + load Picker from a standalone script (rejected for initial scope: more moving parts; can be a follow-up). Using only fetch for Drive and keeping api.js only for Picker (accepted as optional follow-up).

---

## 5. Scopes and config

**Decision**: Keep existing scopes: `https://www.googleapis.com/auth/drive.file`, `https://www.googleapis.com/auth/drive.install`. Keep `config.ts` (clientId, apiKey, appId); no new env vars required for GIS.

**Rationale**: Spec FR-006 requires same scope of Drive access; proposal and spec do not broaden permissions.

---

## References

- [Migrate to Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis)
- [Use the token model (implicit flow)](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Drive API v3](https://developers.google.com/drive/api/guides/about-sdk), [Manage sharing](https://developers.google.com/drive/api/guides/manage-sharing)
- [Google Picker](https://developers.google.com/drive/picker/guides/overview)
- Project proposal: `proposals/GOOGLE_DRIVE_AUTH_MODERNIZATION.md`
