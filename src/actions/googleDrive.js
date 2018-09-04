import config from "../config";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export const saveGraphToGoogleDrive = (fileName, update) => {

  const storeGraphIfSignedIn = (graph, fileId) => {
    const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
    console.log("signed in: ", isSignedIn)
    
    if (isSignedIn) {
      saveFile(graph, fileId)
    }
    return isSignedIn
  }

  const saveFile = (data, fileId) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';

    const metadata = {
      'name': `${fileName}.json`,
      'mimeType': contentType
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      JSON.stringify(data) +
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

    request.execute((file) => console.log(file));
  }

  return function (dispatch, getState) {
    const { graph, storage } = getState()
    const fileId = storage.fileId

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const tryToSaveGraph = async () => {
      while (!storeGraphIfSignedIn(graph, update && fileId)) {
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
}