import config from "../config";
import { setStorage } from "./storage";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive';

export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export const saveGraphToGoogleDrive = (userFileName, nameChanged) => {
  return function (dispatch, getState) {
    saveToStore(getState(), dispatch, userFileName, nameChanged)
  }
}

export const saveToStore = (state, dispatch, userFileName, nameChanged, callback) => {
  const { graph, storage } = state
  const { fileId, fileName } = storage

  const storeGraphIfSignedIn = (graph, fileId, fileName) => {
    const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
    console.log("signed in: ", isSignedIn)

    if (isSignedIn) {
      saveFile(graph, fileId, fileName)
    }
    return isSignedIn
  }

  const saveFile = (data, fileId, fileName) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';

    const metadata = {
      'name': `${fileName}.json`,
      'mimeType': contentType
    };

    console.log("SAVING", data.nodes[0].caption, data.nodes.length)

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;

    const request = window.gapi.client.request({
      'path': `/upload/drive/v3/files${nameChanged || !fileId ? '' : '/' + fileId}`,
      'method': nameChanged || !fileId ? 'POST' : 'PATCH',
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
    while (!storeGraphIfSignedIn(graph, fileId, userFileName || fileName)) {
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