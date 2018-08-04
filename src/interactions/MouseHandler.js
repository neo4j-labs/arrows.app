import {Point} from "../model/Point";
import {click, doubleClick, endDrag, mouseDown, mouseMove, mouseUp} from "../actions/mouse";

export default class MouseHandler {
  constructor(canvas) {
    this.canvas = canvas

    this.canvas.addEventListener('click', this.handleClick.bind(this))
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this))
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
  }

  handleClick (evt) {
    this.dispatch(click(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleDoubleClick (evt) {
    this.dispatch(doubleClick(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleMouseMove (evt) {
    if (evt.button !== 0) {
      return
    }
    this.dispatch(mouseMove(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleMouseDown (evt) {
    if (evt.button !== 0) {
      return
    }

    this.dispatch(mouseDown(this.canvasPosition(evt), evt.metaKey))
    evt.preventDefault()
  }

  handleMouseUp (evt) {
    if (evt.button !== 0) {
      return
    }

    this.dispatch(mouseUp(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleMouseLeave (evt) {
    this.dispatch(endDrag())
    evt.preventDefault()
  }

  canvasPosition(event) {
    let rect = this.canvas.getBoundingClientRect()
    // TODO Origin of right / bottom ISSUE ???
    return new Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    )
  }
}

