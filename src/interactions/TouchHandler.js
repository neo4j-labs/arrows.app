import DragStateMachine, {StateDragging} from './DragStateMachine'
import {Point} from "../model/Point";

export default class TouchHandler {
  constructor(canvas) {
    this.canvas = canvas

    this._registerTouchEvents()

    this._dragMachine = new DragStateMachine()
    this._hasDragged = false
    this.mouseDownNode = null
    this.sourceNodeId = null
    this._mouseDownOnCanvas = false
    this.doubleClickOnCanvas = false
    this.itemBeingDragged = {
      id: 0,
      pinned: true
    }
  }

  _registerTouchEvents () {
    this.canvas.addEventListener('click', this.handleClick.bind(this))
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this))
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }

  handleClick (evt) {
    const item = this.callbacks.nodeFinder.nodeAtPoint(this.eventPosition(evt))
    if (!this._hasDragged && item === null) {
      this.callbacks.canvasClicked(this.eventPosition(evt))
    }
    evt.preventDefault()
  }

  handleDoubleClick (evt) {
    let item = this.callbacks.nodeFinder.nodeAtPoint(this.eventPosition(evt))
    if (item) {
      this.callbacks.nodeDoubleClicked(item)
    } else {
      item = this.callbacks.relationshipFinder.relationshipAtPoint(this.eventPosition(evt))
      if (item) {
        this.callbacks.relationshipDoubleClicked(item)
      } else {
        this.doubleClickOnCanvas = !this.doubleClickOnCanvas
        this.callbacks.canvasDoubleClicked(this.eventPosition(evt))
      }
    }

    evt.preventDefault()
  }

  handleMouseMove (evt) {
    if (evt.button !== 0) {
      return
    }

    if (this.mouseDownNode) {
      this._dragMachine.update(evt)
      if (this._dragMachine.state === StateDragging) {
        this.callbacks.nodeDragged(this.itemBeingDragged.id, this._dragMachine.delta)
      }
    } else if (this.mouseDownRing) {
      this._dragMachine.update(evt)
      this.callbacks.ringDragged(this.mouseDownRing.id, this.eventPosition(evt))
    } else if (this._mouseDownOnCanvas) {
      this._dragMachine.update(evt)
      if (this._dragMachine.state === StateDragging) {
        this.callbacks.pan(this._dragMachine.delta)
      }
    } else {
      const ringUnderCursor = this.callbacks.nodeFinder.nodeRingAtPoint(this.eventPosition(evt))
      if (ringUnderCursor) {
        if (this.sourceNodeId === null || (this.sourceNodeId && ringUnderCursor !== this.sourceNodeId)) {
          this.sourceNodeId = ringUnderCursor
          this.callbacks.activateRing(ringUnderCursor.id)
        }
      } else {
        if (this.sourceNodeId !== null) {
          this.sourceNodeId = null
          this.callbacks.deactivateRing()
        }
      }
    }

    this._hasDragged = this._dragMachine.state === StateDragging

    evt.preventDefault()
  }

  handleMouseDown (evt) {
    if (evt.button !== 0) {
      return
    }

    let cursorPosition = this.eventPosition(evt);

    const nodeUnderCursor = this.callbacks.nodeFinder.nodeAtPoint(cursorPosition)
    const ringUnderCursor = this.callbacks.nodeFinder.nodeRingAtPoint(cursorPosition)

    if (nodeUnderCursor) {
      this.callbacks.nodeMouseDown(nodeUnderCursor, evt.metaKey)
      this.mouseDownNode = nodeUnderCursor
      this.itemBeingDragged = nodeUnderCursor
    } else if (ringUnderCursor) {
      this.mouseDownRing = ringUnderCursor
      this.callbacks.ringDragged(ringUnderCursor.id, cursorPosition)
    } else {
      this._mouseDownOnCanvas = true
    }
    this._hasDragged = false

    this._dragMachine.update(evt)

    evt.preventDefault()
  }

  handleMouseUp (evt) {
    if (evt.button !== 0) {
      return
    }
    this.endMouseEvents()
    evt.preventDefault()
  }

  handleMouseLeave (evt) {
    this.endMouseEvents()
    evt.preventDefault()
  }

  endMouseEvents () {
    this.callbacks.endDrag()
    this.mouseDownNode = null
    this.mouseDownRing = null
    this._mouseDownOnCanvas = false
    this._dragMachine.reset()
  }

  eventPosition(event) {
    let rect = this.canvas.getBoundingClientRect()
    let canvasPosition = new Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    )

    return this.viewTransformation.inverse(canvasPosition)
  }
}

