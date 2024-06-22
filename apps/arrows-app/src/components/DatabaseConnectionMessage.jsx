import React, { Component } from 'react';
import { Modal, Message } from 'semantic-ui-react';

class DatabaseConnectionMessage extends Component {
  render() {
    const { errorMsg, connectionParameters } = this.props;
    const messages = errorMsg
      ? [
          <Message
            key="details"
            error
            header="Neo4j Desktop"
            content={
              'Attempted to connect to ' +
              connectionParameters.connectionUri +
              ' with username ' +
              connectionParameters.username +
              ' and password ' +
              connectionParameters.password.replace(/./g, '*')
            }
          />,
          <Message
            key="errorMsg"
            error
            header="Database connection error"
            content={errorMsg}
          />,
        ]
      : [
          <Message
            key="details"
            error
            header="Neo4j Desktop"
            content="No active connection from Neo4j Desktop"
          />,
        ];
    return (
      <Modal size="tiny" open={true} onClose={this.onCancel}>
        <Modal.Header>Database Connection</Modal.Header>
        <Modal.Content>{messages}</Modal.Content>
      </Modal>
    );
  }
}

export default DatabaseConnectionMessage;
