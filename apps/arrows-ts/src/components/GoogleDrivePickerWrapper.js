import React, { Component } from 'react'
import { connect } from 'react-redux'
import config from "../config"

class GoogleDrivePickerWrapper extends Component {

  componentDidMount() {
    this.tryCreatePicker();
  }

  componentDidUpdate(prevProps) {
    if (this.props.accessToken && !prevProps.accessToken) {
      this.tryCreatePicker();
    }
  }

  tryCreatePicker() {
    const { accessToken } = this.props;
    if (!accessToken || !window.google?.picker) {
      return;
    }
    if (this.picker) {
      this.picker.setVisible(true);
      return;
    }
    const view = new window.google.picker.DocsView();
    view.setMimeTypes("application/vnd.neo4j.arrows+json");
    view.setMode(window.google.picker.DocsViewMode.LIST);
    this.picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .hideTitleBar(true)
      .setOAuthToken(accessToken)
      .setAppId(config.appId)
      .setDeveloperKey(config.apiKey)
      .setCallback(this.pickerCallback.bind(this))
      .build();
    this.picker.setVisible(true);
  }

  pickerCallback({ action, docs }) {
    if (action === 'picked' && docs.length > 0) {
      const fileId = docs[0].id;
      this.props.onFilePicked(fileId);
    }
    if (action === 'cancel') {
      this.props.onCancelPicker();
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({
  accessToken: state.googleDrive?.accessToken
});

export default connect(mapStateToProps)(GoogleDrivePickerWrapper);
