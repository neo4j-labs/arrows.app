import React, {Component} from 'react';
import {Modal, Button} from 'semantic-ui-react'
import ExportPngPanel from "./ExportPngPanel";

class ExportModal extends Component {

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
          <ExportPngPanel
            graph={this.props.graph}
            diagramName={this.props.diagramName}
          />
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