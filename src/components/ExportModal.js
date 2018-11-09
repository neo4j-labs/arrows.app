import React, {Component} from 'react';
import { Modal, Image } from 'semantic-ui-react'
import {ViewTransformation} from "../state/ViewTransformation";
import {getVisualGraph} from "../selectors/index";
import {calculateBoundingBox} from "../graphics/utils/geometryUtils";
import {defaultNewNodeRadius} from "../graphics/constants";
import {Vector} from "../model/Vector";

class ExportModal extends Component {

  onCancel = () => {
    this.props.onCancel()
  }

  render() {
    const boundingBox = calculateBoundingBox(this.props.graph.nodes, defaultNewNodeRadius, 1) || {
        left: 0, top: 0, right: 100, bottom: 100
      }
    boundingBox.width = boundingBox.right - boundingBox.left
    boundingBox.height = boundingBox.bottom - boundingBox.top
    const scaleFactor = 2
    const renderState = {
      graph: this.props.graph,
      selection: {
        selectedNodeIdMap: {},
        selectedRelationshipIdMap: {}
      },
      viewTransformation: new ViewTransformation(scaleFactor, new Vector(-scaleFactor * boundingBox.left, -scaleFactor * boundingBox.top))
    }
    const visualGraph = getVisualGraph(renderState)

    const canvas = window.document.createElement('canvas')
    canvas.width = Math.ceil(scaleFactor * boundingBox.width)
    canvas.height = Math.ceil(scaleFactor * boundingBox.height)
    const ctx = canvas.getContext('2d');
    visualGraph.draw(ctx)
    const dataUrl = canvas.toDataURL()

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