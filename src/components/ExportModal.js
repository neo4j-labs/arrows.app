import React, {Component} from 'react';
import {Modal, Button, Message, Icon, Checkbox} from 'semantic-ui-react'
import PngExport from "./PngExport";

class ExportModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transparentBackground: true
    }
  }

  toggleTransparent = () => {
    this.setState({
      transparentBackground: !this.state.transparentBackground
    })
  }

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    return (
      <Modal
        size="large"
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Export</Modal.Header>
        <Modal.Content scrolling>
          <Message info icon>
            <Icon name='info'/>
            <p>
              Below are a few renderings of the graph at different "pixel ratios".
              Choose your preferred resolution and then get hold of the image by:
              <ul>
                <li>Clicking on the "Download" link to download a file to your computer, or</li>
                <li>Right-clicking on the image and choosing "Copy Image", or</li>
                <li>Dragging the image to another browser tab or to another application.</li>
              </ul>
            </p>
          </Message>
          <Checkbox label='Transparent background' checked={this.state.transparentBackground} onChange={this.toggleTransparent}/>

          {
            [1, 2, 4].map((pixelRatio => (
              <PngExport
                graph={this.props.graph}
                pixelRatio={pixelRatio}
                transparentBackground={this.state.transparentBackground}
              />
            )))
          }

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

export default ExportModal