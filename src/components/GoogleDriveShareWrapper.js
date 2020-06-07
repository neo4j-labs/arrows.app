import React, { Component } from 'react'
import config from "../config";
import { DISCOVERY_DOCS, SCOPES } from '../actions/googleDrive'

export default class extends Component {
  componentDidMount() {
    this.createShareClient()
    this.shareClient.showSettingsDialog()
  }

  createShareClient() {
    const { storage } = this.props

    const setupShareClient = (accessToken) => {
      const shareClient = new window.gapi.drive.share.ShareClient()
      shareClient.setOAuthToken(accessToken)
      shareClient.setItemIds([storage.googleDrive.fileId])
      this.shareClient = shareClient
      console.log("SHARE CLIENT", shareClient)
      //this.props.close();
      //.setCallback(this.shareCallback.bind(this))
    }

    if (window.gapi.auth2.getAuthInstance() && window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      setupShareClient(window.gapi.auth.getToken().access_token)
    } else {
      window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        if (!(window.gapi.auth2.getAuthInstance().isSignedIn.get())) {
          window.gapi.auth2.getAuthInstance().signIn();
        }
        setupShareClient(window.gapi.auth.getToken().access_token)
      })
    }
  }

  shareCallback(res) {
    console.log("ON SHARE", res)
    // if (action === 'picked' && docs.length > 0) {
    //   const fileId = docs[0].id
    //   this.props.onFilePicked(fileId)
    // } else {
    //   console.log("ACTION", action)
    //   this.props.onCancelPicker()
    // }
  }

  render() {
    return null
  }
}
