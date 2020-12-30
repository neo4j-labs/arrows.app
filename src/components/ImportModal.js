import React, {Component} from 'react';
import {Button, Modal, Form, TextArea, Message} from "semantic-ui-react";

class ImportModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      text: '',
      errorMessage: null
    }
  }

  tryImport = () => {
    const result = this.props.tryImport(this.state.text)
    if (result.errorMessage) {
      this.setState({
        errorMessage: result.errorMessage
      })
    }
  }

  render() {
    return (
      <Modal
        size="large"
        centered={false}
        open={true}
        onClose={this.props.onCancel}
      >
        <Modal.Header>Import</Modal.Header>
        <Modal.Content scrolling>
          <Form>
            <TextArea
              placeholder='Paste JSON here...'
              style={{ height: 300 }}
              onChange={(event) => this.setState({text: event.target.value})}
              value={this.state.text}
            />
          </Form>
          {this.state.errorMessage ? (
            <Message negative>
              <Message.Header>Unable to import</Message.Header>
              <p>{this.state.errorMessage}</p>
            </Message>
          ) : null}
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.props.onCancel}
            content="Cancel"
          />
          <Button
            primary
            disabled={this.state.text.length === 0}
            onClick={this.tryImport}
            content="Import"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default ImportModal