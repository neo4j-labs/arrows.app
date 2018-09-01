import React, {Component} from 'react';
import config from "../config";

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

export class GoogleDriveIntegration extends Component {
  componentDidMount() {
    window.gapi.load("client:auth2", this.initClient);
  }

  initClient() {
    const updateSigninStatus = (isSignedIn) => {
      console.log("signed in: ", isSignedIn)
      if (isSignedIn) listFiles()
    }

    const handleAuthClick = (event) => {
      window.gapi.auth2.getAuthInstance().signIn();
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

    window.gapi.client.init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      // Listen for sign-in state changes.
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
      handleAuthClick();
    });
  }

  render() {
    return null
  }
}