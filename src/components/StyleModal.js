import React, {Component} from 'react';
import {Modal, Button, Card} from 'semantic-ui-react'
import {themes} from "../model/themes";
import {renderSvg} from "../graphics/utils/offScreenSvgRenderer";
import {constructGraphFromFile} from "../storage/googleDriveStorage";

class StyleModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {

    const cards = themes.map(theme => {
      const graph = constructGraphFromFile(theme.graph).graph
      const {dataUrl} = renderSvg(graph)

      return (
        <Card>
          <div style={{
            height: 200,
            padding: 10
          }}>
            <img src={dataUrl} alt={theme.description} style={{
              width: '100%',
              position: 'relative',
              top: '50%',
              transform: 'translateY(-50%)'
            }}/>
          </div>
          <Card.Content>
            <Card.Header>{theme.name}</Card.Header>
            <Card.Description>
              {theme.description}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Button
              primary
              size='tiny'
              floated='right'
              content='Apply Theme'
              onClick={() => this.props.onApplyTheme(theme.graph.style)}/>
          </Card.Content>
        </Card>
      );
    })

    return (
      <Modal
        size="large"
        centered={false}
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Choose Theme</Modal.Header>
        <Modal.Content scrolling>
          <Card.Group>
            {cards}
          </Card.Group>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.onCancel}
            content="Done"
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default StyleModal