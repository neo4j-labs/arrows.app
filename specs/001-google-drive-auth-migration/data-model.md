# Data Model: Google Drive Auth Modernization

**Branch**: `001-google-drive-auth-migration` | **Phase**: 1

## Entities

### 1. Access token (credential)

| Field / concept | Type / description | Validation / rules |
|------------------|--------------------|--------------------|
| **access_token** | string (opaque) | Present when user has completed consent and token not yet cleared (401, expiry, sign-out). |
| **expires_at** | number (optional) | Unix ms; optional for pre-emptive UI; 401 is authoritative for "invalid". |

- **Lifecycle**: Obtained via GIS `requestAccessToken()` on user gesture; stored in app state; cleared on 401 from any Drive/Picker call, on expiry (if tracked), or on explicit sign-out.
- **Usage**: Passed as `Authorization: Bearer <access_token>` to Drive API v3 and to Picker `setOAuthToken(accessToken)`.

### 2. Authorized state

| Field | Type | Validation / rules |
|-------|------|--------------------|
| **signedIn** | boolean | True iff app has a valid token and has not yet detected 401/expiry or sign-out. Drives UI ("Authorize" vs "Signed in") and eligibility for open/save/picker/share. |
| **apiInitialized** | boolean | True after GIS token client (and any other required scripts) are ready; allows "Authorize" to be triggered. |

- **State transitions**: (signedIn: false → true) when token is received after user gesture; (signedIn: true → false) when token is cleared due to 401, expiry, or sign-out.
- **Persistence**: In-memory (Redux); no persistence of token to localStorage or URL (per spec security/UX).

### 3. Drive file (diagram)

| Field | Type | Validation / rules |
|-------|------|--------------------|
| **fileId** | string | Google Drive file id (opaque). |
| **name** | string (optional) | User-visible file name. |

- **Relationship**: One current diagram may be associated with one Drive file (when opened from or saved to Drive). Access governed by same token and scopes (drive.file, drive.install).
- **Operations**: Open (read), save (create/overwrite), rename, share/copy link—all use the same access token.

## Redux state slice: `googleDrive`

Current and post-migration shape:

| Key | Type | Description |
|-----|------|-------------|
| **apiInitialized** | boolean | True when GIS (and Picker/Drive script if used) is ready. |
| **signedIn** | boolean | True when we have a valid token and can perform Drive operations. |
| **accessToken** | string \| null | (New) GIS access token; null when not authorized or after clear. |
| **expiresAt** | number \| null | (Optional) Token expiry time (ms); null if not stored. |

- **Validation**: When any Drive or Picker request returns 401, set `accessToken` and `expiresAt` to null and `signedIn` to false.
- **Re-authorize**: User triggers "Authorize" (user gesture) → `requestAccessToken()` → on success store token (and optionally expiresAt) and set signedIn true.

## No schema change to diagram model

Diagram content (graph, styling, etc.) and export formats are unchanged; Drive is transport/storage only. Neo4j property graph model and Cypher export remain as per constitution.
