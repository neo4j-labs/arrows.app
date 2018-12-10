import React, {Component} from 'react';
import {connect} from "react-redux"
import { Modal, Button } from 'semantic-ui-react'

class GoogleSignInModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    return (
      <Modal
        size="tiny"
        open={this.props.showModal}
        onClose={this.onCancel}
      >
        <Modal.Header>Google Drive</Modal.Header>
        <Modal.Content>
          <Button onClick={this.props.signIn}>Authorize Google Drive</Button>
        </Modal.Content>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  return {
    showModal: state.storage.mode === 'GOOGLE_DRIVE' && !state.storage.googleDrive.signedIn
  }
}

const mapDispatchToProps = () => {
  return {
    signIn: () => {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoogleSignInModal)