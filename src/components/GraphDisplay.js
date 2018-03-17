import React, {Component} from 'react';
import TouchHandler from "../interactions/TouchHandler";
import { renderVisuals } from "../graphics/visualsRenderer";
import {nodeAtPoint, nodeRingAtPoint} from "../model/Graph";
import { REMOVE_SELECTION_PATH } from "../actions/gestures";

class GraphDisplay extends Component {
  constructor (props) {
    super (props)
    props.registerAction(
      REMOVE_SELECTION_PATH,
      () => this.props.removeSelectionPath()
    )
  }

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
    const { graph, gestures, guides, viewTransformation, canvasSize,
      pan, moveNode, endDrag, activateRing, deactivateRing, ringDragged,
      editNode, toggleSelection, editRelationship, selectionPathUpdated, removeSelectionPath } = this.props
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
      canvasClicked: position => selectionPathUpdated(position, false),
      canvasDoubleClicked: position => selectionPathUpdated(position, true),
      nodeMouseDown: (node, metaKey) => toggleSelection(node.id, metaKey),
      nodeDoubleClicked: editNode,
      relationshipDoubleClicked: editRelationship,
      nodeDragged: moveNode,
      endDrag,
      activateRing,
      deactivateRing,
      ringDragged,
      marqueeDragged: (from, to) => console.log('MARQUEE', from, to)
    }

    return renderVisuals({visuals: {graph, gestures, guides}, canvas: this.canvas, displayOptions: { canvasSize, viewTransformation }})
  }
}

export default GraphDisplay
