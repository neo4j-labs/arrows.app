import React, {Component} from 'react';
import { Button, Modal, Message } from 'semantic-ui-react'
import { Segment, Grid, Divider, Header, Icon } from 'semantic-ui-react'
import neo4j_logo from  './neo4j_icon.svg'

class StorageConfigModal extends Component {

  render() {
    return (
      <Modal
        open={true}
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