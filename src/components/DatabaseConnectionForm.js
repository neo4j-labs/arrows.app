import React, {Component} from 'react';
import { Button, Form, Modal, Message } from 'semantic-ui-react'
import {defaultConnectionUri} from "../reducers/storageConfiguration";

class DatabaseConnectionForm extends Component {

  constructor(props) {
    super();
    this.state = { ...props.connectionParameters }
  }

  inputUpdated = (_, { name, value }) => {
    this.setState({ [name]: value })
  }

  onSave = () => {
    const { connectionUri, username, password } = this.state;
    this.props.onConnectionParametersUpdated({
      connectionUri,
      username,
      password
    })
  }

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const { open, errorMsg } = this.props;
    const { connectionUri, username, password } = this.state;
    const messages = errorMsg ? [(
      <Message key="errorMsg" error header="Database connection error" content={errorMsg} />
    )] : []
    return (
      <Modal
        size="tiny"
        open={open}
        onClose={this.onCancel}
      >
        <Modal.Header>Database Connection</Modal.Header>
        <Modal.Content>
          <Form error={messages.length > 0}>
            <Form.Field>
              <label>Bolt Connection URI</label>
              <Form.Input
                value={connectionUri}
                name="connectionUri"
                onChange={this.inputUpdated}
                placeholder={defaultConnectionUri}
              />
            </Form.Field>
            <Form.Field>
              <label>Username</label>
              <Form.Input
                value={username}
                name="username"
                autoComplete="username"
                onChange={this.inputUpdated}
                placeholder="Username"
              />
            </Form.Field>
            <Form.Field>
              <label>Password</label>
              <Form.Input
                value={password}
                name="password"
                autoComplete="current-password"
                onChange={this.inputUpdated}
                type="password"
                placeholder="Password"
              />
            </Form.Field>
          </Form>
          {messages}
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Cancel"
          />
          <Button
            type="submit"
            onClick={this.onSave}
            positive
            content="Save"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default DatabaseConnectionForm