import React, { Component } from 'react';
import { renderVisuals } from "../graphics/visualsRenderer";
import {
  DELETE_SELECTION,
  DUPLICATE_SELECTION,
  MOVE_LEFT,
  MOVE_UP,
  MOVE_RIGHT,
  MOVE_DOWN,
  SELECT_ALL,
  UNDO,
  REDO
} from "../interactions/Keybindings";
import MouseHandler from "../interactions/MouseHandler";
import {GraphTextEditors} from "./GraphTextEditors";

class GraphDisplay extends Component {
  constructor(props) {
    super(props)
    props.registerAction(
      DUPLICATE_SELECTION,
      () => props.duplicateSelection()
    )
    props.registerAction(
      DELETE_SELECTION,
      () => props.deleteSelection()
    )
    props.registerAction(
      SELECT_ALL,
      () => props.selectAll()
    )
    props.registerAction(
      MOVE_LEFT,
      (extraKeys) => props.jumpToNextNode('LEFT', extraKeys)
    )
    props.registerAction(
      MOVE_UP,
      (extraKeys) => props.jumpToNextNode('UP', extraKeys)
    )
    props.registerAction(
      MOVE_RIGHT,
      (extraKeys) => props.jumpToNextNode('RIGHT', extraKeys)
    )
    props.registerAction(
      MOVE_DOWN,
      (extraKeys) => props.jumpToNextNode('DOWN', extraKeys)
    )
    props.registerAction(
      UNDO,
      (() => this.props.storage.mode === 'GOOGLE_DRIVE' && props.undo()).bind(this)
    )
    props.registerAction(
      REDO,
      (() => this.props.storage.mode === 'GOOGLE_DRIVE' && props.redo()).bind(this)
    )
  }

  componentDidMount() {
    this.touchHandler = new MouseHandler(this.canvas)
    this.drawVisuals()
  }

  componentDidUpdate() {
    this.fitCanvasSize(this.canvas, this.props.canvasSize.width, this.props.canvasSize.height)
    this.drawVisuals()
  }

  render() {
    return (
      <div style={{
        transform: 'translate(0, 0)'
      }}>
        <canvas ref={(elm) => this.canvas = elm}/>
        <GraphTextEditors
          visualGraph={this.props.visualGraph}
          viewTransformation={this.props.viewTransformation}
          onSetNodeCaption={this.props.onSetNodeCaption}
          onSetRelationshipType={this.props.onSetRelationshipType}
          selection={this.props.selection}
        />
      </div>
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
    const { visualGraph, selection, gestures, guides, handles, toolboxes, viewTransformation, canvasSize } = this.props
    renderVisuals({
      visuals: { visualGraph, selection, gestures, guides, handles, toolboxes },
      canvas: this.canvas,
      displayOptions: { canvasSize, viewTransformation }
    })

    this.touchHandler.setDispatch(this.props.dispatch)
  }
}

export default GraphDisplay
