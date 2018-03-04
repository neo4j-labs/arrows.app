import React, {Component} from 'react';
import TouchHandler from "../interactions/TouchHandler";
import { renderVisuals } from "../graphics/visualsRenderer";
import {nodeAtPoint, nodeRingAtPoint} from "../model/Graph";

class GraphDisplay extends Component {

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized.bind(this))
    this.touchHandler = new TouchHandler(this.canvas)
    this.visualGraph = this.drawVisuals();
  }

  componentDidUpdate() {
    this.visualGraph = this.drawVisuals();
  }

  render() {
    return (
      <canvas width={this.props.canvasSize.width} height={this.props.canvasSize.height} ref={(elm) => this.canvas = elm} />
    )
  }

  drawVisuals() {
    const { graph, gestures, guides, viewTransformation, canvasSize, pan, moveNode, endDrag, activateRing, deactivateRing, ringDragged, editNode, toggleSelection, editRelationship } = this.props
    this.touchHandler.viewTransformation = viewTransformation
    const visualGraph = this.visualGraph
    this.touchHandler.callbacks = {
      nodeFinder: {
        nodeAtPoint: (point) => nodeAtPoint(graph, point),
        nodeRingAtPoint: (point) => nodeRingAtPoint(graph, point)
      },
      relationshipFinder: {
        relationshipAtPoint: (point) => visualGraph.relationshipAtPoint(graph, point)
      },
      pan,
      canvasClicked: () => {},
      nodeClicked: (node) => toggleSelection([node.id]),
      nodeDoubleClicked: editNode,
      relationshipDoubleClicked: editRelationship,
      nodeDragged: moveNode,
      endDrag,
      activateRing,
      deactivateRing,
      ringDragged
    }

    return renderVisuals({visuals: {graph, gestures, guides}, canvas: this.canvas, displayOptions: { canvasSize, viewTransformation }})
  }
}

export default GraphDisplay
