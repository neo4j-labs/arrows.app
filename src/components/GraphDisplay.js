import React, {Component} from 'react';
import TouchHandler from "../interactions/TouchHandler";
import { renderVisuals } from "../graphics/visualsRenderer";

class GraphDisplay extends Component {

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized.bind(this))
    this.touchHandler = new TouchHandler(this.canvas, this)
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
    const { graph, gestures, guides, viewTransformation, canvasSize, pan, moveNode, endDrag, activateRing, deactivateRing, ringDragged } = this.props
    this.touchHandler.viewTransformation = viewTransformation
    this.touchHandler.callbacks = {
      pan,
      canvasClicked: () => {},
      nodeClicked: (node) => {},
      nodeDoubleClicked: (node) => {},
      nodeDragged: moveNode,
      endDrag,
      activateRing,
      deactivateRing,
      ringDragged
    }

    renderVisuals({visuals: {graph, gestures, guides}, canvas: this.canvas, displayOptions: { canvasSize, viewTransformation }})
  }

  getNodeAtPoint(point) {
    return this.props.graph.nodes.find((node) =>
      node.position.vectorFrom(point).distance() < node.radius)
  }

  getNodeRingAtPoint(point) {
    return this.props.graph.nodes.find((node) => {
      const distance = node.position.vectorFrom(point).distance()
      return distance > node.radius && distance < node.radius + 10;
    })
  }
}

export default GraphDisplay
