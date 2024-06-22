import React, { Component } from 'react';
import { Button, Modal, Input } from 'semantic-ui-react';

class SaveAsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diagramName: 'Copy of ' + this.props.diagramName,
    };
  }

  onChange = (event) => {
    this.setState({
      diagramName: event.target.value,
    });
  };

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.commit();
    }
  };

  commit = () => {
    this.props.onCreate(this.state.diagramName);
  };

  render() {
    return (
      <Modal size="mini" open={true} onClose={this.props.onCancel}>
        <Modal.Header>Save as new diagram…</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            value={this.state.diagramName}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.props.onCancel} content="Cancel" />
          <Button
            type="submit"
            onClick={this.commit}
            positive
            content="Create"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default SaveAsModal;
