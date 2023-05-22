import React, {Component} from 'react';
import {connect} from "react-redux"
import {Button, Modal, Header, Divider, Card} from 'semantic-ui-react'
import {hideHelpDialog} from "../actions/applicationDialogs";
import {rememberHelpDismissed} from "../actions/localStorage";
import YouTube from "react-youtube";
import {DUPLICATE_SELECTION, REDO, SELECT_ALL, UNDO, getKeybindingString} from "../interactions/Keybindings";

class HelpModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const keyBindings = [
      {key: getKeybindingString(SELECT_ALL), description: 'Select All'},
      {key: 'Backspace or Delete', description: 'Delete'},
      {key: 'Enter', description: 'Edit node/relationship'},
      {key: 'Escape', description: 'Stop editing'},
      {key: getKeybindingString(DUPLICATE_SELECTION), description: 'Duplicate'},
      {key: getKeybindingString(UNDO), description: 'Undo'},
      {key: getKeybindingString(REDO), description: 'Redo'},
    ].map(binding => (
      <Card key={binding.key}>
        <Card.Content>
          <Card.Header>{binding.key}</Card.Header>
          <Card.Meta>{binding.description}</Card.Meta>
        </Card.Content>
      </Card>
    ))
    return (
      <Modal
        size="small"
        open={this.props.showModal}
        onClose={this.onCancel}
      >
        <Modal.Header>Help</Modal.Header>
        <Modal.Content scrolling>
          <Header size='small'>New to arrows.app?</Header>
          <p>Learn about arrows.app by visiting <a href="https://neo4j.com/labs/arrows" target='_blank'>Neo4j Labs</a>,
            or watching this short video:</p>
          <YouTube videoId="ZHJ-BrKJ8A4" opts={{
            height: '360',
            width: '640',
          }} />
          <Divider />
          <Header size='small'>Keyboard shortcuts</Header>
          <Card.Group itemsPerRow={4}>
            {keyBindings}
          </Card.Group>
          <Header size='small'>Feedback</Header>
          <p>If you find a bug or want to give feedback about arrows.app, please head over to our <a
            href='https://github.com/neo4j-labs/arrows.app' target='_blank'>GitHub repository</a>.</p>
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