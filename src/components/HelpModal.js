import React, {Component} from 'react';
import {connect} from "react-redux"
import {Button, Modal} from 'semantic-ui-react'
import {hideHelpDialog} from "../actions/applicationDialogs";
import {rememberHelpDismissed} from "../actions/localStorage";
import {informationLinks} from "./informationLinks";
import YouTube from "react-youtube";

class HelpModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const links = informationLinks.map(link => {
      const [linkText, href] = link
      return (
        <p style={{
          marginLeft: '20px',
        }}>
          <a href={href} target='_blank'>
            {linkText}
          </a>
        </p>
      )
    })
    return (
      <Modal
        size="small"
        open={this.props.showModal}
        onClose={this.onCancel}
      >
        <Modal.Header>Help</Modal.Header>
        <Modal.Content scrolling>
          <YouTube videoId="ZHJ-BrKJ8A4" opts={{
            height: '360',
            width: '640',
          }} />
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Done"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  return {
    showModal: state.applicationDialogs.showHelpDialog
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCancel: () => {
      rememberHelpDismissed()
      dispatch(hideHelpDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HelpModal)