import React, {Component} from 'react';
import TouchHandler from "../interactions/TouchHandler";
import { renderVisuals } from "../graphics/visualsRenderer";
import {nodeAtPoint, nodeRingAtPoint} from "../model/Graph";

class GraphDisplay extends Component {

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized.bind(this))
    this.touchHandler = new TouchHandler(this.canvas)
    this.drawVisuals();
  }

  componentDidUpdate() {
    this.drawVisuals();
  }

  render() {
    return (
      <canvas width={this.props.canvasSize.width} height={this.props.canvasSize.height} ref={(elm) => this.canvas = elm} />
    )
  }

  drawVisuals() {
    const { graph, gestures, guides, viewTransformation, canvasSize, pan, moveNode, endDrag, activateRing, deactivateRing, ringDragged, editNode } = this.props
    this.touchHandler.viewTransformation = viewTransformation
    this.touchHandler.callbacks = {
      nodeFinder: {
        nodeAtPoint: (point) => nodeAtPoint(graph, point),
        nodeRingAtPoint: (point) => nodeRingAtPoint(graph, point)
      },
      pan,
      canvasClicked: () => {},
      nodeClicked: (node) => {},
      nodeDoubleClicked: editNode,
      nodeDragged: moveNode,
      endDrag,
      activateRing,
      deactivateRing,
      ringDragged
    }

    renderVisuals({visuals: {graph, gestures, guides}, canvas: this.canvas, displayOptions: { canvasSize, viewTransformation }})
  }
}

export default GraphDisplay
