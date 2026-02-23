/**
 * Google Identity Services (GIS) token client for Drive auth.
 * Replaces gapi.auth2; token is stored in Redux and used for Drive API v3 and Picker.
 * Auth must be requested on user gesture only (requestAccessToken).
 */

import config from './config';
import { SCOPES } from './actions/googleDrive';

let tokenClient = null;
let storeRef = null;

/**
 * Initialize the GIS token client. Call once when the app bootstraps (after GSI script loaded).
 * Does not request a token or open consent.
 * @param {Object} store - Redux store (for dispatching token/signedIn and for getAccessToken)
 */
export function initTokenClient(store) {
  storeRef = store;
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    return;
  }
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        return;
      }
      storeRef.dispatch({
        type: 'SET_GOOGLE_DRIVE_TOKEN',
        accessToken: response.access_token,
        expiresAt: response.expires_in ? Date.now() + response.expires_in * 1000 : null
      });
    }
  });
}

/**
 * Request an access token. Must be called in response to a user gesture (e.g. Authorize button).
 * Opens consent if needed. On success, token is stored in Redux via callback.
 */
export function requestAccessToken() {
  if (!tokenClient) {
    return;
  }
  tokenClient.requestAccessToken();
}

/**
 * Returns the current access token from Redux state, or null if not authorized.
 * Used by storage, Picker, and share for Authorization header or setOAuthToken.
 * @param {Object} state - Redux state (or getState())
 * @returns {string|null}
 */
export function getAccessToken(state) {
  if (!state?.googleDrive?.accessToken) {
    return null;
  }
  return state.googleDrive.accessToken;
}

/**
 * Clears the stored token and sets signedIn to false.
 * Optionally revokes the token with google.accounts.oauth2.revoke.
 * Call on explicit sign-out or when any Drive/Picker request returns 401.
 */
export function signOut() {
  if (!storeRef) {
    return;
  }
  const state = storeRef.getState();
  const token = state?.googleDrive?.accessToken;
  if (token && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(token);
  }
  storeRef.dispatch({ type: 'CLEAR_GOOGLE_DRIVE_TOKEN' });
}
