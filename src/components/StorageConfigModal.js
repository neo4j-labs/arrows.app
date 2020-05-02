import React, { Component } from 'react';
import { Button, Modal, Message } from 'semantic-ui-react'
import { Segment, Grid, Divider, Header, Icon } from 'semantic-ui-react'
import neo4j_logo from './neo4j_icon.svg'
import FeatureToggle from "./FeatureToggle"

export default ({ useGoogleDriveStorage, useNeo4jDatabaseStorage }) =>
  <Modal
    open={true}>
    <Modal.Header>Where would you like to store your diagram?</Modal.Header>
    <Modal.Content>
      <Segment placeholder>
        <Grid columns={2} stackable textAlign='center'>
          <FeatureToggle name="storage.DATABASE" renderIf={true}>
            <Divider vertical>Or</Divider>
          </FeatureToggle>

          <Grid.Row verticalAlign='middle'>
            <FeatureToggle name="storage.GOOGLE_DRIVE" renderIf={true}>
              <Grid.Column>
                <Header icon>
                  <Icon name='google drive'/>
                  Google Drive
                </Header>
                <p style={{ height: '3em' }}>Store the diagram as a JSON file in your Google Drive.</p>
                <Button primary onClick={useGoogleDriveStorage}>use Google Drive</Button>

              </Grid.Column>
            </FeatureToggle>

            <FeatureToggle name="storage.DATABASE" renderIf={true}>
              <Grid.Column>
                <Header icon>
                  <i className="icon" style={{ height: '1em' }}>
                    <img src={neo4j_logo} style={{ height: '1em' }}/>
                  </i>
                  Neo4j
                </Header>
                <p style={{ height: '3em' }}>Store the diagram as a Graph in a Neo4j database at a given Bolt connection
                  URL.</p>
                <Button primary onClick={useNeo4jDatabaseStorage}>use Neo4j Database</Button>
              </Grid.Column>
            </FeatureToggle>
          </Grid.Row>
        </Grid>
      </Segment>
      <Message attached='bottom' info icon>
        <Icon name='info'/>
        This is a serverless app; it runs entirely in your web browser and doesn't have any storage of its own.
        Instead it stores graph diagrams using one of the options above.
      </Message>
    </Modal.Content>
  </Modal>
