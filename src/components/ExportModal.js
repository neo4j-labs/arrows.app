import React, {Component} from 'react';
import { Modal, Image } from 'semantic-ui-react'
import {renderGraphAtScaleFactor} from "../graphics/utils/offScreenCanvasRenderer";

class ExportModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const dataUrl = renderGraphAtScaleFactor(this.props.graph, 2)

    return (
      <Modal
        size="large"
        open={true}
        onClose={this.onCancel}
      >
        <Modal.Header>Export</Modal.Header>
        <Modal.Content>
          <div style={{
            maxHeight: 300,
            overflow: 'scroll'
          }}>
            <Image src={dataUrl}/>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default ExportModal