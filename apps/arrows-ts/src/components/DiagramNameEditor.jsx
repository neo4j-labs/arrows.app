import React, { Component } from 'react';
import { Modal, Button, Input, Menu } from 'semantic-ui-react';
import DocumentTitle from 'react-document-title';

export class DiagramNameEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editable: false,
      diagramName: props.diagramName,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.diagramName !== this.props.diagramName) {
      this.setState({
        diagramName: nextProps.diagramName,
      });
    }
  }

  onClick = () => {
    this.setState({
      editable: true,
    });
  };

  onChange = (event) => {
    this.setState({
      diagramName: event.target.value,
    });
  };

  onCancel = () => {
    this.setState({
      editable: false,
    });
  };

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.commit();
    }
  };

  commit = () => {
    this.setState({
      editable: false,
    });
    this.props.setDiagramName(this.state.diagramName);
  };

  render() {
    return (
      <React.Fragment>
        <Menu.Item onClick={this.onClick}>
          <DocumentTitle title={this.props.diagramName + ' - Arrows'}>
            <span style={{ fontWeight: 'bold' }}>{this.props.diagramName}</span>
          </DocumentTitle>
        </Menu.Item>
        <Modal open={this.state.editable} size="mini" onClose={this.onCancel}>
          <Modal.Header>Diagram Name</Modal.Header>
          <Modal.Content>
            <Input
              fluid
              value={this.state.diagramName}
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.onCancel} content="Cancel" />
            <Button
              type="submit"
              onClick={this.commit}
              positive
              content="Save"
            />
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}
