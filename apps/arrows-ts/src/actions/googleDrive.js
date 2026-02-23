import config from "../config";
import {renderPngForThumbnail} from "../graphics/utils/offScreenCanvasRenderer";
import {indexableText} from "../model/Graph";
import {initTokenClient} from "../googleDriveAuth";

export const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
export const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install';

/**
 * Initialize Google Drive API: GIS token client + gapi for Picker/Drive upload only.
 * Does not request a token or open consent; sets apiInitialized when ready.
 * Any Drive or Picker request that receives 401 must dispatch clearGoogleDriveToken(store)
 * so that signedIn is set false and the user can re-authorize on next user gesture.
 */
export const initGoogleDriveApi = (store) => {
  initTokenClient(store);

  const initGapiForPickerAndDrive = () => {
    if (!window.gapi) {
      store.dispatch({ type: 'GOOGLE_DRIVE_API_INITIALIZED' });
      return;
    }
    // Load gapi for Picker and Drive upload only; no auth2. (drive-share removed; ShareClient replaced in US4.)
    window.gapi.load("client:picker", () => {
      window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        store.dispatch({ type: 'GOOGLE_DRIVE_API_INITIALIZED' });
      }).catch(() => {
        store.dispatch({ type: 'GOOGLE_DRIVE_API_INITIALIZED' });
      });
    });
  };

  if (window.google?.accounts?.oauth2) {
    initGapiForPickerAndDrive();
  } else {
    window.addEventListener('load', () => {
      if (window.google?.accounts?.oauth2) {
        initGapiForPickerAndDrive();
      } else {
        store.dispatch({ type: 'GOOGLE_DRIVE_API_INITIALIZED' });
      }
    });
  }
};

/** Clear token and set signedIn false. Call on 401 from any Drive/Picker request or on explicit sign-out. */
export const clearGoogleDriveToken = () => ({
  type: 'CLEAR_GOOGLE_DRIVE_TOKEN'
});

export const signIn = () => {
  // Replaced by requestAccessToken() from googleDriveAuth; kept for compatibility until modal wired.
};

/**
 * Rename a Drive file. Uses access token from Redux. On 401, dispatch clearGoogleDriveToken.
 */
export const renameGoogleDriveStore = (fileId, userFileName, accessToken, dispatch) => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`;
  fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: userFileName })
  })
    .then(res => {
      if (res.status === 401) {
        dispatch?.(clearGoogleDriveToken());
        return;
      }
      return res.json();
    })
    .then(() => {})
    .catch(err => console.error('Rename error', err));
};

const base64urlEncodeDataUrl = (dataUrl) => {
  return dataUrl.substring('data:image/png;base64,'.length).replace(/\+/g, '-').replace(/\//g, '_');
};

/**
 * Save diagram to Drive (create or overwrite). Uses access token from Redux. On 401, dispatch clearGoogleDriveToken.
 */
export const saveFile = (graph, cachedImages, fileId, fileName, onFileSaved, accessToken, dispatch) => {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
  const contentType = 'application/vnd.neo4j.arrows+json';

  const metadata = {
    name: fileName,
    mimeType: contentType,
    contentHints: {
      thumbnail: {
        image: base64urlEncodeDataUrl(renderPngForThumbnail(graph, cachedImages).dataUrl),
        mimeType: 'image/png'
      },
      indexableText: indexableText(graph)
    }
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + contentType + '\r\n\r\n' +
    JSON.stringify({ graph }) +
    close_delim;

  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files${fileId ? '/' + fileId : ''}?uploadType=multipart&supportsAllDrives=true`;
  fetch(uploadUrl, {
    method: fileId ? 'PATCH' : 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'multipart/related; boundary="' + boundary + '"'
    },
    body: multipartRequestBody
  })
    .then(res => {
      if (res.status === 401) {
        dispatch?.(clearGoogleDriveToken());
        return null;
      }
      return res.json();
    })
    .then(file => {
      if (file?.id) {
        onFileSaved(file.id);
      }
    })
    .catch(err => console.error('Save error', err));
};
