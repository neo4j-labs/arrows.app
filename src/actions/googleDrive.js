import config from "../config";
import { setStorage } from "./storage";
import {renderGraphAtScaleFactor} from "../graphics/utils/offScreenCanvasRenderer";
export const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
export const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.install';

export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export const renameGoogleDriveStore = (fileId, userFileName) => {
  window.gapi.client.drive.files.update({
    "fileId": fileId,
    "resource": {
      "name": userFileName
    }
  })
    .then(function(response) {
        // Handle the results here (response.result has the parsed body).
        console.log("Response", response);
      },
      function(err) { console.error("Execute error", err); });
}

export const saveGraphToGoogleDrive = () => {
  return function (dispatch, getState) {
    saveToStore(getState(), dispatch)
  }
}

const base64urlEncodeDataUrl = (dataUrl) => {
  return dataUrl.substring('data:image/png;base64,'.length).replace(/\+/g, '-').replace(/\//g, '_')
}

export const saveToStore = (state, dispatch, callback) => {
  const { graph, storage } = state
  const { fileId } = storage
  const fileName = state.diagramName

  const storeGraphIfSignedIn = (graph, fileId, fileName) => {
    const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
    console.log("signed in: ", isSignedIn)

    if (isSignedIn) {
      saveFile(graph, fileId, fileName)
    }
    return isSignedIn
  }

  const saveFile = (graph, fileId, fileName) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/vnd.neo4j.arrows+json';

    const metadata = {
      'name': `${fileName}`,
      'mimeType': contentType,
      'contentHints': {
        'thumbnail': {
          'image': base64urlEncodeDataUrl(renderGraphAtScaleFactor(graph, 2)),
          'mimeType': 'image/png'
        }
      }
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      JSON.stringify(graph) +
      close_delim;

    const request = window.gapi.client.request({
      'path': `/upload/drive/v3/files${fileId ? '/' + fileId : ''}`,
      'method': fileId ? 'PATCH' : 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody
    });

    request.execute((file) => {
      console.log(file)
      dispatch(setStorage('googleDrive', file.id, file.name.slice(0, file.name.lastIndexOf('.json'))))
      callback && callback(true)
    });
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const tryToSaveGraph = async () => {
    while (!storeGraphIfSignedIn(graph, fileId, fileName)) {
      console.log("SLEEPING")
      await sleep(1000)
    }
  }

  const signInAndSave = () => {
    if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      tryToSaveGraph()
    } else {
      window.gapi.auth2.getAuthInstance().signIn();
      tryToSaveGraph()
    }
  }

  if (window.gapi.client.drive) {
    signInAndSave()
  } else {
    window.gapi.client.init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      signInAndSave()
    })
  }
}