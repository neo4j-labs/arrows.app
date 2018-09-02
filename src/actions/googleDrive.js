import config from "../config";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export const saveGraphToGoogleDrive = () => {

  const storeGraphIfSignedIn = (graph) => {
    const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
    console.log("signed in: ", isSignedIn)
    if (isSignedIn) createFile(graph)
    return isSignedIn
  }

  const createFile = (data) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';

    const metadata = {
      'name': "arrows-graph.json",
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
      'path': '/upload/drive/v3/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody
    });

    request.execute((file) => console.log(file));
  }

  return function (dispatch, getState) {
    const graph = getState().graph

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const tryToSaveGraph = async () => {
      while (!storeGraphIfSignedIn(graph)) {
        console.log("SLEEPING")
        await sleep(1000)
      }
    }

    window.gapi.client.init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        tryToSaveGraph()
      } else {
        window.gapi.auth2.getAuthInstance().signIn();
        tryToSaveGraph()
      }
    })
  }
}