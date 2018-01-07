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
    const { graph, guides, viewTransformation, canvasSize, pan, moveNode, endDrag } = this.props
    this.touchHandler.viewTransformation = viewTransformation
    this.touchHandler.callbacks = {
      pan,
      canvasClicked: () => {},
      nodeClicked: (node) => {},
      nodeDoubleClicked: (node) => {},
      nodeDragged: moveNode,
      endDrag
    }

    renderVisuals({visuals: {graph, guides}, canvas: this.canvas, displayOptions: { canvasSize, viewTransformation }})
  }

  getNodeAtPoint(point) {
    return this.props.graph.nodes.find((node) =>
      node.position.vectorFrom(point).distance() < node.radius)
  }
}

export default GraphDisplay
