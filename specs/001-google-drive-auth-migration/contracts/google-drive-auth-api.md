# Contract: Google Drive Auth API (in-app)

**Scope**: The interface provided by the Google Drive auth layer to the rest of the app (components, storage, picker, share). All token acquisition is via GIS; no `gapi.auth2` or `gapi.auth.getToken()`.

## Initialization

- **initGoogleDriveApi(store)** (or equivalent)
  - Loads GIS and prepares the token client (initTokenClient with clientId and scopes).
  - Does **not** request a token or open consent; only makes "Authorize" available.
  - Dispatches or sets state so that `apiInitialized === true` when ready.
  - May still load Picker / api.js if required for Picker.

## Token acquisition (user gesture only)

- **requestAccessToken()** (or equivalent, e.g. bound to "Authorize" / "Sign in with Google")
  - Must be called in response to a user gesture (FR-002).
  - Calls GIS `tokenClient.requestAccessToken()`.
  - On success: store access token (and optionally expiry) in Redux; set `signedIn` to true; dispatch/update state.
  - On error/cancel: do not set signedIn; do not store token.

## Token access

- **getAccessToken()** (or equivalent)
  - Returns the current access token (string or null). Used by storage, Picker, and share to pass `Authorization: Bearer <token>` or `setOAuthToken(accessToken)`.
  - Returns null when not authorized (no token or token cleared after 401/expiry/sign-out).

## Sign-out / revoke

- **signOut()** (or equivalent)
  - Clears stored token and sets `signedIn` to false.
  - Optionally calls `google.accounts.oauth2.revoke(access_token)`.
  - After this, Drive operations must not be performed until the user authorizes again.

## 401 handling

- Any Drive API or Picker call that receives 401 (or equivalent "invalid/expired token") must:
  - Clear the stored token and set `signedIn` to false (same as signOut from token perspective).
  - Allow the user to trigger "Authorize" again (requestAccessToken on next user gesture).

## Redux state consumed by UI

- **signedIn**: boolean — show "Signed in" vs "Authorize", enable/disable Drive actions.
- **apiInitialized**: boolean — enable/disable "Authorize" button (e.g. disable until ready).

No other modules may depend on `gapi.auth2` or `gapi.auth.getToken()`.
