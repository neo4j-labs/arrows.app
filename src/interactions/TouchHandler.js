import DragStateMachine, {StateDragging} from './DragStateMachine'
import {Point} from "../model/Point";

export default class TouchHandler {
  constructor(canvas, nodeFinder) {
    this.canvas = canvas
    this.nodeFinder = nodeFinder;

    this._registerTouchEvents()

    this._dragMachine = new DragStateMachine()
    this._hasDragged = false
    this.mouseDownNode = null
    this.activeRing = null
    this._mouseDownOnCanvas = false
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
    const item = this.nodeFinder.getNodeAtPoint(this.eventPosition(evt))
    if (!this._hasDragged) {
      if (item) {
        this.callbacks.nodeClicked(item)
      } else {
        this.callbacks.canvasClicked()
      }
    }
    evt.preventDefault()
  }

  handleDoubleClick (evt) {
    const item = this.nodeFinder.getNodeAtPoint(this.eventPosition(evt))
    if (item) {
      this.callbacks.nodeDoubleClicked()
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
      this.callbacks.ringDragged(this.mouseDownRing.id, this.mouseDownRing.position, this.eventPosition(evt))
    } else if (this._mouseDownOnCanvas) {
      this._dragMachine.update(evt)
      if (this._dragMachine.state === StateDragging) {
        this.callbacks.pan(this._dragMachine.delta)
      }
    } else {
      const ringUnderCursor = this.nodeFinder.getNodeRingAtPoint(this.eventPosition(evt))
      if (ringUnderCursor) {
        if (this.activeRing === null || (this.activeRing && ringUnderCursor !== this.activeRing)) {
          this.activeRing = ringUnderCursor
          this.callbacks.activateRing(ringUnderCursor.id)
        }
      } else {
        if (this.activeRing !== null) {
          this.activeRing = null
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

    const nodeUnderCursor = this.nodeFinder.getNodeAtPoint(cursorPosition)
    const ringUnderCursor = this.nodeFinder.getNodeRingAtPoint(cursorPosition)

    if (nodeUnderCursor) {
      // Do not drag or select until figure out users' intention
      this.mouseDownNode = nodeUnderCursor
      this.itemBeingDragged = nodeUnderCursor
    } else if (ringUnderCursor) {
      this.mouseDownRing = ringUnderCursor
      this.callbacks.ringDragged(ringUnderCursor.id, cursorPosition, cursorPosition)
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

