import React, {Component} from 'react';
import { Modal } from 'semantic-ui-react'
import {ViewTransformation} from "../state/ViewTransformation";
import {getVisualGraph} from "../selectors/index";
import {calculateBoundingBox} from "../graphics/utils/geometryUtils";
import {defaultNewNodeRadius} from "../graphics/constants";
import {Vector} from "../model/Vector";

class ExportModal extends Component {

  constructor(props) {
    super(props)
    this.boundingBox = calculateBoundingBox(this.props.graph.nodes, defaultNewNodeRadius, 1) || {
        left: 0, top: 0, right: 100, bottom: 100
      }
    this.boundingBox.width = this.boundingBox.right - this.boundingBox.left
    this.boundingBox.height = this.boundingBox.bottom - this.boundingBox.top
    this.scaleFactor = 2
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
        <Modal.Content>
          <div style={{
            maxHeight: 300,
            overflow: 'scroll'
          }}>
          <canvas
            width={Math.ceil(this.scaleFactor * this.boundingBox.width)}
            height={Math.ceil(this.scaleFactor * this.boundingBox.height)}
            ref={(canvas) => this.canvas = canvas}
          />
          </div>
        </Modal.Content>
      </Modal>
    )
  }

  componentDidMount() {
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  draw() {
    const renderState = {
      graph: this.props.graph,
      selection: {
        selectedNodeIdMap: {},
        selectedRelationshipIdMap: {}
      },
      viewTransformation: new ViewTransformation(this.scaleFactor, new Vector(-this.scaleFactor * this.boundingBox.left, -this.scaleFactor * this.boundingBox.top))
    }
    const visualGraph = getVisualGraph(renderState)
    const ctx = this.canvas.getContext('2d');
    visualGraph.draw(ctx)
  }
}

export default ExportModal