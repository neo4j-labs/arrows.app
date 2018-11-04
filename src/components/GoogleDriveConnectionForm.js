import React, { Component } from 'react'
import config from "../config";
import { Form, Button, Icon } from 'semantic-ui-react'
import { DISCOVERY_DOCS, SCOPES } from '../actions/googleDrive'

export class GoogleDriveConnection extends Component {

  componentDidMount () {
    this.createPicker()
  }

  createPicker() {
    const setupPicker = (accessToken) => {
      this.picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
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
    }
  }

  render () {
    return (
      <Form>
        <Form.Field>
          <label>Load from Google Drive</label>
          <Button color='google plus' onClick={() => this.picker.setVisible(true)}>
            <Icon name='google drive' />
            Load from Google Drive
          </Button>
        </Form.Field>
        <Form.Field>
          <Button positive onClick={() => this.props.saveToDrive()}>
            <Icon name='google drive' />
            Save to Google Drive
          </Button>
        </Form.Field>
      </Form>
    )
  }
}