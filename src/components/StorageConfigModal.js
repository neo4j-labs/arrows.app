import React, {Component} from 'react';
import { Button, Form, Checkbox, Modal, Message } from 'semantic-ui-react'
import {defaultConnectionUri} from "../reducers/storage";
import { Tab, Segment, Grid, Divider, Header, Icon } from 'semantic-ui-react'
import { GoogleDriveConnection } from "./GoogleDriveConnectionForm";
import neo4j_logo from  './neo4j_icon.svg'

class StorageConfigModal extends Component {

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

    const dbTabContent = (
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
        {messages}
        <div style={{'textAlign': 'right'}}>
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
        </div>
      </Form>
    )

    return (
      <Modal
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Where would you like to store your diagram?</Modal.Header>
        <Modal.Content>
          <Segment placeholder>
            <Grid columns={2} stackable textAlign='center'>
              <Divider vertical>Or</Divider>

              <Grid.Row verticalAlign='middle'>
                <Grid.Column>
                  <Header icon>
                    <Icon name='google drive' />
                    Google Drive
                  </Header>
                  <p style={{height: '3em'}}>Store the diagram as a JSON file in your Google Drive.</p>
                  <Button primary onClick={this.props.useGoogleDriveStorage}>use Google Drive</Button>

                </Grid.Column>

                <Grid.Column>
                  <Header icon>
                    <i className="icon" style={{height: '1em'}}>
                      <img src={neo4j_logo} style={{height: '1em'}}/>
                    </i>
                    Neo4j
                  </Header>
                  <p style={{height: '3em'}}>Store the diagram as a Graph in a Neo4j database at a given Bolt connection URL.</p>
                  <Button primary onClick={this.props.useNeo4jDatabaseStorage}>use Neo4j Database</Button>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
          <Message attached='bottom' info icon>
            <Icon name='info' />
            This is a serverless app; it runs entirely in your web browser and doesn't have any storage of its own.
            Instead it stores graph diagrams using one of the options above.
          </Message>
        </Modal.Content>
      </Modal>
    )
  }
}

export default StorageConfigModal