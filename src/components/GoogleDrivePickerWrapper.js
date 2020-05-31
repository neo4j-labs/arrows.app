import React, { Component } from 'react'
import config from "../config";
import { DISCOVERY_DOCS, SCOPES } from '../actions/googleDrive'

export default class extends Component {

  componentDidMount () {
    this.createPicker()
    this.picker.setVisible(true)
  }

  createPicker() {
    const setupPicker = (accessToken) => {
      const view = new window.google.picker.View(window.google.picker.ViewId.DOCS)
      view.setMimeTypes("application/vnd.neo4j.arrows+json")
      this.picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .hideTitleBar(true)
        .setOAuthToken(accessToken)
        .setDeveloperKey(config.apiKey)
        .setCallback(this.pickerCallback.bind(this))
        .build();
    }

    if (window.gapi.auth2.getAuthInstance() && window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      const accessToken = window.gapi.auth.getToken().access_token
      setupPicker(accessToken)
    } else {
      window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
          setupPicker(window.gapi.auth.getToken().access_token)
        } else {
          window.gapi.auth2.getAuthInstance().signIn();
          setupPicker(window.gapi.auth.getToken().access_token)
        }
      })
    }
  }

  pickerCallback ({action, docs}) {
    if (action === 'picked' && docs.length > 0) {
      const fileId = docs[0].id
      this.props.onFilePicked(fileId)
    } else {
      console.log("ACTION", action)
      this.props.onCancelPicker()
    }
  }

  render () {
    return null
  }
}
