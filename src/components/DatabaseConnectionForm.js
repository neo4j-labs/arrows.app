import React, {Component} from 'react';
import { Button, Form, Checkbox, Modal, Message } from 'semantic-ui-react'
import {defaultConnectionUri} from "../reducers/storage";

class DatabaseConnectionForm extends Component {

  constructor(props) {
    super(props);
    this.state = { ...props.connectionParameters }
  }

  inputUpdated = (_, { name, value }) => {
    this.setState({ [name]: value })
  }

  checkboxUpdated = (_, { name, checked }) => {
    this.setState({ [name]: checked })
    if (name === 'rememberCredentials' && !checked) {
      this.props.forgetConnectionParameters()
    }
  }

  onSave = () => {
    const { connectionUri, username, password, rememberCredentials } = this.state;
    this.props.onConnectionParametersUpdated({
      connectionUri,
      username,
      password,
      rememberCredentials
    })
  }

  onKeyUp = (e) => {
    if (e.key === "Enter") {
      this.onSave()
    }
  }

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const { errorMsg } = this.props;
    const { connectionUri, username, password, rememberCredentials } = this.state;
    const messages = errorMsg ? [(
      <Message key="errorMsg" error header="Database connection error" content={errorMsg} />
    )] : []
    return (
      <Modal
        size="tiny"
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Database Connection</Modal.Header>
        <Modal.Content>
          <Form error={messages.length > 0} onKeyUp={this.onKeyUp}>
            <Form.Field>
              <label>Bolt Connection URI</label>
              <Form.Input
                iconPosition='left'
                icon='lightning'
                value={connectionUri}
                name="connectionUri"
                onChange={this.inputUpdated}
                placeholder={defaultConnectionUri}
              />
            </Form.Field>
            <Form.Field>
              <label>Username</label>
              <Form.Input
                iconPosition='left'
                icon='user'
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
                iconPosition='left'
                icon='lock'
                value={password}
                name="password"
                autoComplete="current-password"
                onChange={this.inputUpdated}
                type="password"
                placeholder="Password"
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                checked={rememberCredentials}
                name='rememberCredentials'
                onChange={this.checkboxUpdated}
                label='Remember credentials'
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