import React, { Component } from 'react'
import config from "../config";
import { Form, Button, Icon, Popup, Input } from 'semantic-ui-react'
import { defaultConnectionUri } from "../reducers/databaseConnection";

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export class GoogleDriveConnection extends Component {
  state = {
    fileName: this.props.storage.fileName
  }

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
          <Form.Input
            placeholder='file name'
            value={this.state.fileName}
            icon='file'
            iconPosition='left' size='medium'
            onChange={evt => this.setState({fileName: evt.target.value}) } />
          <Button positive onClick={() => this.props.saveToDrive(this.state.fileName, this.state.fileName !== this.props.storage.fileName)}>
            <Icon name='google drive' />
            Save to Google Drive
          </Button>
        </Form.Field>
      </Form>
    )
  }
}