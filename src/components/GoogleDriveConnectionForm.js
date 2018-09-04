import React, { Component } from 'react'
import config from "../config";
import { Form, Button, Icon, Popup, Input } from 'semantic-ui-react'
import { defaultConnectionUri } from "../reducers/databaseConnection";

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export class GoogleDriveConnection extends Component {
  state = {
    fileName: ''
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

    const getFileMeta = (fileId) => {
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`
      var accessToken = window.gapi.auth.getToken().access_token
      var xhr = new XMLHttpRequest();
      xhr.open('GET', downloadUrl)
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
      xhr.onload = () => {
        const fullFileName = JSON.parse(xhr.responseText).name
        const noExtensionName = fullFileName.slice(0, fullFileName.lastIndexOf('.json'))
        this.setState({
          fileName: noExtensionName,
          originalFileName: noExtensionName
        })
      }
      xhr.onerror = error => console.log(error)
      xhr.send()
    }

    if (window.gapi.auth2.getAuthInstance() && window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      const accessToken = window.gapi.auth.getToken().access_token
      setupPicker(accessToken)
      if (this.props.fileId) {
        getFileMeta(this.props.fileId)
      }
    } else {
      window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
          setupPicker(window.gapi.auth.getToken().access_token)
          if (this.props.fileId) {
            getFileMeta(this.props.fileId)
          }
        } else {
          window.gapi.auth2.getAuthInstance().signIn();
          setupPicker(window.gapi.auth.getToken().access_token)
          if (this.props.fileId) {
            getFileMeta(this.props.fileId)
          }
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
          <Button positive onClick={() => this.props.saveToDrive(this.state.fileName, this.state.fileName === this.state.originalFileName)}>
            <Icon name='google drive' />
            Save to Google Drive
          </Button>
        </Form.Field>
      </Form>
    )
  }
}