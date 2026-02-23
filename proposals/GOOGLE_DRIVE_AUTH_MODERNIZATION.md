# Google Drive Auth & API Modernization

The app’s Google Drive integration uses **deprecated Google auth**. This should be addressed **before** (or in parallel with) the TypeScript migration so you’re not typing code that will soon need to be replaced.

---

## 1. What the app uses today

### 1.1 Script and auth

| Item | Current usage |
|------|----------------|
| **Script** | `https://apis.google.com/js/api.js` (in `apps/arrows-ts/index.html`) |
| **Load** | `gapi.load("client:auth2:picker:drive-share", initClient)` |
| **Auth** | **`gapi.auth2`** – sign-in, `getAuthInstance()`, `isSignedIn.listen()`, `signIn()`, `getToken().access_token` |
| **Drive API** | **Drive v3** (REST) – discovery doc and endpoints are still current |
| **Token usage** | Access token from `gapi.auth.getToken().access_token` passed to: Drive file GET/PATCH/POST, Picker, Share client |

### 1.2 Files involved

| File | Role |
|------|------|
| `apps/arrows-ts/index.html` | Loads `apis.google.com/js/api.js` |
| `apps/arrows-ts/src/actions/googleDrive.js` | `initGoogleDriveApi`, `signIn`, `saveFile`, `renameGoogleDriveStore`; uses `gapi.client.init`, `gapi.auth2`, `gapi.client.drive.files.update`, `gapi.client.request` (upload) |
| `apps/arrows-ts/src/storage/googleDriveStorage.js` | `fetchGraphFromDrive`; uses `window.gapi.auth.getToken().access_token` and XHR to Drive v3 `files/{id}` |
| `apps/arrows-ts/src/components/GoogleDrivePickerWrapper.js` | Picker; uses `gapi.auth2`, `gapi.auth.getToken()`, `window.google.picker.PickerBuilder` |
| `apps/arrows-ts/src/components/GoogleDriveShareWrapper.js` | Share dialog; uses `gapi.auth2`, `gapi.auth.getToken()`, `window.gapi.drive.share.ShareClient` |
| `apps/arrows-ts/src/components/editors/GoogleSignInModal.jsx` | “Authorize” button calls `gapi.auth2.getAuthInstance().signIn()` |
| `apps/arrows-ts/src/reducers/googleDrive.js` | Stores `signedIn`; status updated from `gapi.auth2.getAuthInstance().isSignedIn.listen()` |
| `apps/arrows-ts/src/config.ts` | `clientId`, `apiKey`, `appId` for Google (env + hardcoded) |

### 1.3 Scopes

- `https://www.googleapis.com/auth/drive.file` – per-file access (files created/opened by the app)
- `https://www.googleapis.com/auth/drive.install` – “Open with” / “New” in Drive UI

---

## 2. What’s deprecated and why it matters

- **`gapi.auth2` is deprecated.**  
  Google’s migration guide: [Migrate to Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis).  
  You must stop using:
  - `gapi.load('auth2', ...)` / `gapi.load('client:auth2:...')`
  - `gapi.auth2.getAuthInstance()`
  - `GoogleAuth.signIn()`, `isSignedIn.get()`, `isSignedIn.listen()`
  - `gapi.auth.getToken().access_token`

- **Drive API v3** and the **Drive REST URLs** (e.g. `https://www.googleapis.com/drive/v3/files/...`) are **not** deprecated. The only change needed for Drive is **how you obtain the access token** (from GIS instead of gapi.auth2).

- **Google Picker** is still supported. You keep using `google.picker.PickerBuilder` and `setOAuthToken(accessToken)`; the token will come from GIS instead of gapi.

- **`gapi.drive.share.ShareClient`** is part of the older gapi stack. Current Drive sharing is done via the [Drive API](https://developers.google.com/drive/api/guides/manage-sharing) (e.g. permissions). The Share UI that `ShareClient` provided may have a GIS-era equivalent or need to be replaced with a simple “Copy link” / permissions flow using the REST API.

---

## 3. Recommended approach: GIS token + existing Drive/Picker usage

- **Add Google Identity Services (GIS)** for auth only:
  - Load: `https://accounts.google.com/gsi/client` (in addition to or instead of `api.js` for auth).
  - Use **implicit flow** (token in the browser): `google.accounts.oauth2.initTokenClient()` and `TokenClient.requestAccessToken()` with your existing scopes.
- **Keep using**:
  - **Drive API v3** – same endpoints; call them with `fetch` or XHR + `Authorization: Bearer <token>` (you already do this in `googleDriveStorage.js` for GET; upload/update can stay with `gapi.client.request` or be switched to `fetch` with the same token).
  - **Picker** – same Picker API; pass the token from GIS to `setOAuthToken(accessToken)`.
- **Session state:**  
  GIS does not manage “signed in” for you like auth2 did. You store the access token (and optionally expiry) in app state; when a Drive/Picker call returns 401 or token is expired, prompt again with `requestAccessToken()` (user gesture). Your existing `googleDrive.signedIn` (and any “Authorize” UI) can be driven by “we have a valid token” instead of `gapi.auth2.getAuthInstance().isSignedIn.get()`.

So: **replace only the auth source (gapi.auth2 → GIS), then keep or minimally adapt Drive and Picker usage.**

---

## 4. Suggested order vs TypeScript migration

- **Option A – Before any TS migration:**  
  Do one branch/PR that: (1) adds GIS script and token client, (2) replaces all `gapi.auth2` and `gapi.auth.getToken()` usage with GIS token retrieval and your own “has token” state, (3) keeps Drive v3 and Picker calls as they are, but fed with the GIS token.  
  Then continue with your existing Phase 0 (RootState, react-recompose) and lib consolidation. No deprecated APIs left when you start typing.

- **Option B – Alongside Phase 0:**  
  Same work as above, but in the same timeframe as Phase 0 (e.g. Phase 0 = prep + Google auth modernization).  
  Slightly larger Phase 0 PR, but one less moving part later.

Recommendation: **Option A** – do Google auth modernization first, then Phase 0. That way Phase 0 doesn’t touch auth, and you avoid typing `gapi.auth2` only to remove it in the next PR.

---

## 5. High-level migration steps

1. **Load GIS**
   - In `index.html`, add `<script src="https://accounts.google.com/gsi/client" async defer></script>`.
   - Keep `api.js` for now if you still use `gapi.client` for Drive (upload/update); or remove it and use `fetch` for all Drive calls.

2. **Token client**
   - Create a small module (e.g. `googleDriveAuth.js` or `googleAuth.ts`) that:
     - Calls `google.accounts.oauth2.initTokenClient({ client_id, scope: SCOPES, callback })` with your existing `clientId` and scopes.
     - Exposes a function that, on user gesture (e.g. “Authorize” or “Open from Drive”), calls `tokenClient.requestAccessToken()` and in the callback stores the token (and expiry if you want) and dispatches “signed in” to Redux.

3. **Replace auth usage**
   - **initGoogleDriveApi:** Remove `gapi.load('client:auth2:...')` and `gapi.auth2.getAuthInstance().isSignedIn.listen/get()`. Initialize only the GIS token client and (if you keep it) `gapi.client` for Drive. “Signed in” = we have a token (and optionally not expired).
   - **Sign-in:** In `GoogleSignInModal` and anywhere else that calls `gapi.auth2.getAuthInstance().signIn()`, call your new “request token” function instead.
   - **Getting the token:** Everywhere that uses `window.gapi.auth.getToken().access_token`, use the token from your Redux state (or from the token client callback) instead.
   - **googleDriveStorage.js:** Keep the same XHR/fetch to Drive v3; pass the token from state/callback.
   - **googleDrive.js (saveFile, renameGoogleDriveStore):** Either keep `gapi.client.request` and set the token on the client, or switch to `fetch` + Drive v3 REST with `Authorization: Bearer <token>`.

4. **Picker**
   - Keep loading the Picker (e.g. from `api.js` or [Picker docs](https://developers.google.com/drive/picker/guides/overview)); when building the Picker, call `setOAuthToken(accessToken)` with the token from your app state (from GIS).

5. **Drive Share**
   - Check whether `gapi.drive.share.ShareClient` is still the recommended way to show a share dialog. If not, replace with Drive API v3 [permissions](https://developers.google.com/drive/api/guides/manage-sharing) and a simple “Copy link” / share UI.

6. **Token lifecycle**
   - On 401 from any Drive call, clear token and show “Authorize” again; call `requestAccessToken()` on next user gesture.
   - Optionally: use `google.accounts.oauth2.revoke(access_token)` when user explicitly signs out / revokes.

7. **Cleanup**
   - Remove `gapi.load('auth2', ...)` and all `gapi.auth2` / `gapi.auth.getToken()` references.
   - If you no longer need `api.js` (e.g. you use fetch for all Drive and load Picker another way), remove the script from `index.html`.

---

## 6. References

- [Migrate to Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis) – what to remove and what to use instead.
- [Use the token model (implicit flow)](https://developers.google.com/identity/oauth2/web/guides/use-token-model) – `initTokenClient`, `requestAccessToken`, callback.
- [Google Identity Services – Overview](https://developers.google.com/identity/gsi/web/guides/overview).
- [Drive API v3](https://developers.google.com/drive/api/guides/about-sdk) – still current; only auth changes.
- [Google Picker](https://developers.google.com/drive/api/guides/picker) – use with OAuth token from GIS.

---

## 7. Summary

| Area | Status | Action |
|------|--------|--------|
| **gapi.auth2** | Deprecated | Replace with GIS: load GSI client, init token client, request access token on user gesture, store token and drive “signed in” yourself. |
| **Drive API v3** | Current | Keep; only switch to using the token from GIS. |
| **Picker** | Supported | Keep; pass GIS token to `setOAuthToken`. |
| **Drive Share (ShareClient)** | Legacy gapi | Check current docs; replace with Drive permissions API + own UI if needed. |

Do this **before** the TypeScript migration so the code you convert to TS is already on the supported auth stack.
