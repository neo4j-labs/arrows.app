import React, { Component } from 'react'
import config from "../config";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export class GoogleDriveConnection extends Component {
  componentDidMount () {
    this.createPicker()
  }

  createPicker() {
    const openPicker = (accessToken) => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(config.apiKey)
        .setCallback(this.pickerCallback.bind(this))
        .build();
      picker.setVisible(true);
    }

    if (window.gapi.auth2.getAuthInstance() && window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      const accessToken = window.gapi.auth.getToken().access_token
      openPicker(accessToken)
    } else {
      window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
          openPicker(window.gapi.auth.getToken().access_token)
        } else {
          window.gapi.auth2.getAuthInstance().signIn();
          openPicker(window.gapi.auth.getToken().access_token)
        }
      })
    }
  }

  pickerCallback ({action, docs}) {
    console.log('PICKER CALLBACK', action)
    if (action === 'picked' && docs.length > 0) {
      const fileId = docs[0].id
      this.props.onFilePicked(fileId)
    }
  }

  render () {
    return (
      <div>
        <button type="button" id="auth" disabled>Authenticate</button>
        <div id="result"></div>
      </div>
    )
  }
}