import React, { Component } from 'react';
import { Button, Modal, Form, TextArea, Message } from 'semantic-ui-react';

class ImportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      errorMessage: null,
    };
  }

  tryImport = () => {
    const result = this.props.tryImport(
      this.state.text,
      this.props.separation,
      this.props.ontologies
    );
    if (result.errorMessage) {
      this.setState({
        errorMessage: result.errorMessage,
      });
    }
  };

  fileChange = () => {
    const files = this.fileInputRef.files;
    if (files.length > 0) {
      const file = files[0];
      file.text().then((text) => {
        this.setState({ text });
      });
    }
  };

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
          <Message>
            <p>
              Import using the same JSON or LinkML structure as you can see in
              the Export window.
            </p>
            <p>
              Alternatively, if you don't provide a JSON or LinkML object, input
              will be treated as plain text, delimited by tabs and line breaks.
              For example, copy and paste from a spreadsheet to create one node
              per cell.
            </p>
            <p>
              Both of these import formats are also available by simply pasting
              into the app; you don't need to use this Import window if you
              already have the data on your clipboard.
            </p>
          </Message>
          <Form>
            <Form.Field>
              <Button
                content="Choose File"
                labelPosition="left"
                icon="file"
                onClick={() => this.fileInputRef.click()}
              />
              <input
                ref={(element) => (this.fileInputRef = element)}
                type="file"
                hidden
                onChange={this.fileChange}
              />
            </Form.Field>
            <TextArea
              placeholder="Choose a file, or paste text here..."
              style={{
                height: 300,
                fontFamily: 'monospace',
              }}
              onChange={(event) => this.setState({ text: event.target.value })}
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
          <Button onClick={this.props.onCancel} content="Cancel" />
          <Button
            primary
            disabled={this.state.text.length === 0}
            onClick={this.tryImport}
            content="Import"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ImportModal;
