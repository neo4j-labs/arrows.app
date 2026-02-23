# Quickstart: Google Drive Auth Modernization

**Branch**: `001-google-drive-auth-migration`

## Prerequisites

- Node and npm/yarn per repo root.
- Google Cloud project with Drive API and appropriate OAuth client (same clientId as current app); no new APIs need to be enabled for GIS.
- Local config: `apps/arrows-ts/src/config.ts` (or env) must provide `clientId`, `apiKey`, `appId` for Google.

## Implementation order (high level)

1. **Add GIS and token client**
   - In `apps/arrows-ts/index.html`, add:  
     `<script src="https://accounts.google.com/gsi/client" async defer></script>`
   - Add a small module (e.g. `googleDriveAuth.js` or `googleAuth.ts`) that:
     - Calls `google.accounts.oauth2.initTokenClient({ client_id, scope: SCOPES, callback })` with existing clientId and scopes.
     - Exposes a function to request token on user gesture (e.g. `requestAccessToken()`), and in the callback stores the token in Redux and dispatches signedIn.

2. **Redux state**
   - In `reducers/googleDrive.js`: add `accessToken` (and optionally `expiresAt`); keep `signedIn` and `apiInitialized`. "Signed in" is derived from having a valid token (and not yet cleared by 401/sign-out).
   - On 401 from any Drive/Picker call, clear token and set signedIn to false.

3. **Replace auth usage**
   - **initGoogleDriveApi**: Remove `gapi.load('client:auth2:...')` and `isSignedIn.listen`/`get`. Initialize GIS token client and (if kept) gapi for Picker/Drive upload. Set apiInitialized when ready.
   - **Sign-in**: In `GoogleSignInModal` (and any other place that called `gapi.auth2.getAuthInstance().signIn()`), call the new "request token" function instead.
   - **Getting the token**: Everywhere that used `window.gapi.auth.getToken().access_token`, use the token from Redux (or from the token client callback) instead.

4. **Drive and Picker**
   - **googleDriveStorage.js**: Keep existing fetch/XHR to Drive v3; pass token from state (Authorization: Bearer).
   - **actions/googleDrive.js** (saveFile, rename): Either keep `gapi.client.request` and set the token on the client, or switch to `fetch` + Drive v3 with Bearer token.
   - **GoogleDrivePickerWrapper**: Build Picker as today; call `setOAuthToken(accessToken)` with token from Redux (from GIS).

5. **Share**
   - Replace `GoogleDriveShareWrapper` use of `gapi.drive.share.ShareClient` with Drive API v3 permissions + "Copy link" (and optional share UI). Use same token for API calls.

6. **Sign-out**
   - Provide explicit sign-out that clears token and sets signedIn to false; optionally call `google.accounts.oauth2.revoke(access_token)`.

7. **Cleanup**
   - Remove all `gapi.auth2` and `gapi.auth.getToken()` references.
   - If api.js is no longer needed (e.g. all Drive via fetch and Picker loaded another way), remove it from index.html; otherwise leave it and only remove auth2 usage.

## Key files (arrows-ts)

| File | Change |
|------|--------|
| `index.html` | Add GSI script; later optionally remove api.js if unused. |
| `src/actions/googleDrive.js` | GIS init + token request; Drive calls use token from state. |
| `src/storage/googleDriveStorage.js` | Token from state for Drive v3 requests. |
| `src/reducers/googleDrive.js` | Add accessToken (and optionally expiresAt); signedIn from token. |
| `src/components/GoogleDrivePickerWrapper.js` | setOAuthToken(token from state). |
| `src/components/GoogleDriveShareWrapper.js` | Replace ShareClient with Drive API v3 + copy link. |
| `src/components/editors/GoogleSignInModal.jsx` | Call new requestAccessToken on Authorize. |
| New (optional) | `src/googleDriveAuth.js` or `googleAuth.ts` — GIS token client only. |

## Testing

- **Authorization**: Trigger "Authorize", complete consent, confirm signedIn and one Drive operation works.
- **Open/Save/Rename**: After authorize, open from Drive, save (new and overwrite), rename; verify in Drive.
- **Picker**: Open picker, select file, confirm app receives and can open it.
- **401**: Simulate or wait for expiry; confirm UI shows not authorized and "Authorize" works again.
- **Sign-out**: Sign out, confirm Drive actions are disabled until re-authorize.

## References

- Spec: `specs/001-google-drive-auth-migration/spec.md`
- Plan: `specs/001-google-drive-auth-migration/plan.md`
- Research: `specs/001-google-drive-auth-migration/research.md`
- Proposal: `proposals/GOOGLE_DRIVE_AUTH_MODERNIZATION.md`
