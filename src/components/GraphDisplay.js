import React, {Component} from 'react';
import TouchHandler from "../interactions/TouchHandler";
import { renderVisuals } from "../graphics/visualsRenderer";
import { REMOVE_SELECTION_PATH } from "../actions/gestures";
import { DELETE_SELECTION } from "../interactions/Keybindings";

class GraphDisplay extends Component {
  constructor (props) {
    super (props)
    props.registerAction(
      REMOVE_SELECTION_PATH,
      () => this.props.removeSelectionPath()
    )
    props.registerAction(
      DELETE_SELECTION,
      () => this.props.deleteSelection()
    )
  }

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
    const { graph, gestures, guides, viewTransformation, canvasSize,
      pan, moveNode, endDrag, activateRing, deactivateRing, ringDragged,
      editNode, toggleSelection, editRelationship,
      removeSelectionPath, marqueeDragged, marqueeEnded,
      toggleInspector, selectionPathUpdated } = this.props
    this.touchHandler.viewTransformation = viewTransformation
    const visualGraph = renderVisuals({
      visuals: {graph, gestures, guides},
      canvas: this.canvas,
      displayOptions: { canvasSize, viewTransformation }
    })

    this.touchHandler.callbacks = {
      entityAtPoint: (point) => visualGraph.entityAtPoint(point),
      pan,
      canvasClicked: position => selectionPathUpdated(position, false),
      canvasDoubleClicked: position => selectionPathUpdated(position, true),
      entityMouseDown: (entity, metaKey) => toggleSelection(entity, metaKey),
      entityDoubleClicked: toggleInspector,
      nodeDragged: moveNode,
      endDrag,
      activateRing,
      deactivateRing,
      ringDragged,
      marqueeDragged,
      marqueeEnded
    }
  }
}

export default GraphDisplay
