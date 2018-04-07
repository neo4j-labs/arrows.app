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

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResized.bind(this))
    this.touchHandler = new TouchHandler(this.canvas)
    this.fitCanvasSize(this.canvas, this.props.canvasSize.width, this.props.canvasSize.height)
    this.drawVisuals();
  }

  componentDidUpdate() {
    this.fitCanvasSize(this.canvas, this.props.canvasSize.width, this.props.canvasSize.height)
    this.drawVisuals();
  }

  render() {
    return (
      <canvas ref={(elm) => this.canvas = elm} />
    )
  }

  fitCanvasSize(canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    const context = canvas.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1
    const ratio = devicePixelRatio / backingStoreRatio

    if (devicePixelRatio !== backingStoreRatio) {
      canvas.width = width * ratio
      canvas.height = height * ratio

      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'

      // now scale the context to counter
      // the fact that we've manually scaled
      // our canvas element
      context.scale(ratio, ratio)
    }

    return ratio
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
