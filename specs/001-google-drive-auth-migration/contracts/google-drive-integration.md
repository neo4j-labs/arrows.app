# Contract: Google Drive integration (external)

**Scope**: How the app integrates with Google’s services: scopes, token usage, and endpoints. This contract must hold for the app to work with Google’s current supported APIs.

## Scopes

- `https://www.googleapis.com/auth/drive.file` — Per-file access (files created or opened by the app).
- `https://www.googleapis.com/auth/drive.install` — "Open with" / "New" in Drive UI.

No additional scopes without spec/plan update.

## Token source

- **Auth**: Google Identity Services (GIS); token model (implicit flow).
- **Token** is obtained via `google.accounts.oauth2.initTokenClient` + `requestAccessToken()` on user gesture only.
- Same token is used for: Drive API v3, Google Picker, and any share/permissions calls.

## Drive API v3

- **Base**: `https://www.googleapis.com/drive/v3/`
- **Auth**: `Authorization: Bearer <access_token>` on every request.
- **Endpoints used**:
  - GET `/files/{fileId}` — read file (e.g. diagram content).
  - POST `/files` (multipart) — create file.
  - PATCH `/files/{fileId}` (multipart) — update file (overwrite).
  - PATCH `/files/{fileId}` (JSON body) — update metadata (e.g. name for rename).
  - Permissions: as needed for share/copy link (e.g. create permission, get webViewLink).

## Google Picker

- **Token**: Same GIS access token; passed to Picker via `setOAuthToken(accessToken)`.
- **Scope**: Same as above (drive.file, drive.install) sufficient for Picker to list/select app-relevant files.

## Share (post-migration)

- **No** use of `gapi.drive.share.ShareClient`.
- Use Drive API v3 for permissions and file metadata (e.g. webViewLink) and in-app "Copy link" (and optional share UI).

## Deprecated / removed

- `gapi.auth2` — must not be used.
- `gapi.auth.getToken()` — must not be used.
- `gapi.load('client:auth2:...')` for auth — must not be used for auth; api.js may remain for Picker (and optionally Drive upload) with token supplied from GIS.
