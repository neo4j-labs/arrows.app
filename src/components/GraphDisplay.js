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

  onWindowResized () {
    const parent = this.canvas.parentElement
    const rect = parent.getBoundingClientRect()
    this.props.onWindowResized(rect.width, rect.height)
  }

  fitCanvasSize () {
    let width = this.props.canvasSize.width
    let height = this.props.canvasSize.height
    let devicePixelRatio = window.devicePixelRatio || 1

    this.canvas.width = width * devicePixelRatio
    this.canvas.height = height * devicePixelRatio
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResized.bind(this))
    this.touchHandler = new TouchHandler(this.canvas)
    this.fitCanvasSize()
    this.drawVisuals();
  }

  componentDidUpdate() {
    this.fitCanvasSize()
    this.drawVisuals();
  }

  render() {
    return (
      <canvas ref={(elm) => this.canvas = elm} />
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
