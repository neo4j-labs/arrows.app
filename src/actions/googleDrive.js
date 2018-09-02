import config from "../config";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const saveGraphToGoogleDrive = () => {

  const listFilesIfSignedIn = () => {
    const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
    console.log("signed in: ", isSignedIn)
    if (isSignedIn) listFiles()
    if (isSignedIn) createFile({hello: true})
    return isSignedIn
  }

  const listFiles = () => {
    const appendPre = (message) => {
      console.log(message)
    }
    window.gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then((response) => {
      appendPre('Files:');
      const files = response.result.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          appendPre(file.name + ' (' + file.id + ')');
        }
      } else {
        appendPre('No files found.');
      }
    });
  }

  const createFile = (data) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';

    const metadata = {
      'name': "hello.json",
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
      'body': multipartRequestBody});

    request.execute((file) => console.log(file));
  }

  window.gapi.client.init({
    apiKey: config.apiKey,
    clientId: config.clientId,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(() => {
    if (!listFilesIfSignedIn()) {
      window.gapi.auth2.getAuthInstance().signIn();
      const keepTrying = setTimeout(() => {
        if (!listFilesIfSignedIn()) keepTrying()
      }, 1000)
      keepTrying()
    }
  })

  return () => {}
}