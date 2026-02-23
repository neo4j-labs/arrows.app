import React, {Component} from 'react';
import {connect} from "react-redux"
import { Modal, Button } from 'semantic-ui-react'
import {cancelGoogleDriveAuthorization} from "../../actions/storage";
import {requestAccessToken} from "../../googleDriveAuth";

class GoogleSignInModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  onAuthorize = () => {
    // Must be in response to user gesture only (FR-002).
    this.props.requestAccessToken()
  }

  render() {
    const { showModal, apiInitialized } = this.props;
    return (
      <Modal
        size="small"
        open={showModal}
        onClose={this.onCancel}
      >
        <Modal.Header>Google Drive</Modal.Header>
        <Modal.Content>
          <p>Arrows.app can store its files in Google Drive,
            but needs your authorization to do so.</p>
          <p>To proceed you will need to have a Google account,
            and grant two permission scopes to this app:</p>
          <ul>
            <li>drive.file - Per-file access to files created or opened by the app.
              This means that the app will only be able to access files it created itself,
              or which you specifically open with the app.
            </li>
            <li>drive.install - Adds "New" and "Open with" menu items to
              the <a href='https://developers.google.com/drive/api/v3/about-apps' target='_blank'>
                Google Drive UI</a>.
            </li>
          </ul>
          <p>Please see the <a href='https://developers.google.com/drive/api/v3/about-auth' target='_blank'>
            Google documentation</a> if you'd like to learn more about these permissions.</p>
          <p>If you don't wish to grant these permissions, please cancel this message.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Cancel"
          />
          <Button
            primary
            disabled={!apiInitialized}
            onClick={this.onAuthorize}
            content="Authorize"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  return {
    showModal: !state.googleDrive.signedIn &&
      (state.storage.mode === 'GOOGLE_DRIVE' || state.storage.status === 'PICKING_FROM_GOOGLE_DRIVE'),
    apiInitialized: state.googleDrive.apiInitialized,
    signedIn: state.googleDrive.signedIn
  }
}

const mapDispatchToProps = dispatch => {
  return {
    requestAccessToken,
    onCancel: () => {
      dispatch(cancelGoogleDriveAuthorization())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoogleSignInModal)