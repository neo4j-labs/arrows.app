import React, {Component} from 'react';
import { renderVisuals } from "../graphics/visualsRenderer";
import {DELETE_SELECTION, SELECT_ALL} from "../interactions/Keybindings";
import MouseHandler from "../interactions/MouseHandler";

class GraphDisplay extends Component {
  constructor (props) {
    super (props)
    props.registerAction(
      'REMOVE_SELECTION_PATH',
      () => this.props.removeSelectionPath()
    )
    props.registerAction(
      DELETE_SELECTION,
      () => this.props.deleteSelection()
    )
    props.registerAction(
      SELECT_ALL,
      () => this.props.selectAll()
    )
  }

  onWindowResized () {
    this.fitToParent()
  }

  fitToParent () {
    const parent = this.canvas.parentElement
    const rect = parent.getBoundingClientRect()
    this.props.onWindowResized(rect.width, rect.height)
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResized.bind(this))
    this.touchHandler = new MouseHandler(this.canvas)
    this.fitToParent()
    this.drawVisuals()
  }

  componentDidUpdate() {
    this.fitCanvasSize(this.canvas, this.props.canvasSize.width, this.props.canvasSize.height)
    this.drawVisuals()
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
    const { visualGraph, selection, gestures, guides, viewTransformation, canvasSize } = this.props
    renderVisuals({
      visuals: {visualGraph, selection, gestures, guides},
      canvas: this.canvas,
      displayOptions: { canvasSize, viewTransformation }
    })

    this.touchHandler.setDispatch(this.props.dispatch)
  }
}

export default GraphDisplay
