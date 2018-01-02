import DragStateMachine, {StateDragging, StatePressed} from './DragStateMachine'
import {Point} from "../model/Point";

export default class TouchHandler {
  constructor(canvas, panZoomState, nodeFinder, callbacks) {
    this.canvas = canvas
    this.nodeFinder = nodeFinder;
    this.callbacks = callbacks;

    this._registerTouchEvents()

    this._dragMachine = new DragStateMachine()
    this.panZoomState = panZoomState
    this._hasDragged = false
    this._mouseDownItem = null
    this._mouseDownOnCanvas = false
    this._dragData = {
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
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }

  handleClick (evt) {
    const item = this._getTargetItem(evt, ['node', 'relationship'])
    if (!this._hasDragged) {
      if (item) {
        this.parentHandler.callIfRegistered('click', item)
      } else {
        // Always call select handler even if item = null, this triggers unselect
        // this.parentHandler.callIfRegistered('click', {})
      }
    }
    evt.preventDefault()
  }

  handleDoubleClick (evt) {
    const item = this._getTargetItem(evt, ['node', 'relationship'])
    if (item) {
      this.parentHandler.callIfRegistered('doubleClick', item)
    }
    evt.preventDefault()
  }

  _toLayoutCoord (value) {
    let devicePixelRatio = window.devicePixelRatio || 1
    return value * devicePixelRatio / this.panZoomState.zoom
  }

  handleMouseMove (evt) {
    if (evt.button !== 0) {
      return
    }

    if (this._mouseDownItem) {
      let prevState = this._dragMachine.state
      this._dragMachine.update(evt)
      if (this._dragMachine.state === StateDragging) {
        if (prevState === StatePressed) {
          this.parentHandler.callIfRegistered('dragStart', this._mouseDownItem.id)
        }
        const newPosition = {
          x: this._dragData.x + this._toLayoutCoord(this._dragMachine.dx),
          y: this._dragData.y + this._toLayoutCoord(this._dragMachine.dy)
        }
        this._dragData.moveTo(newPosition)
      }
    } else if (this._mouseDownOnCanvas) {
      this._dragMachine.update(evt)
      if (this._dragMachine.state === StateDragging) {
        this.panZoomState.pan = this.panZoomState.pan.minus(this._dragMachine.delta)
        console.log(this.panZoomState.pan)
      }
    }

    this._hasDragged = this._dragMachine.state === StateDragging

    evt.preventDefault()
  }

  handleMouseDown (evt) {
    if (evt.button !== 0) {
      return
    }

    const item = this._getTargetItem(evt)
    if (item) {
      // Do not drag or select until figure out users' intention
      this._mouseDownItem = item
      this._dragData = item
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
    if (this._mouseDownItem && this._dragMachine.state === StateDragging) {
      this.parentHandler.callIfRegistered('dragEnd')
    }
    this._mouseDownItem = null
    this._mouseDownOnCanvas = false
    this._dragMachine.reset()
  }

  handleContextMenu (evt) {
    let hitItems = this._getTargetItems(evt, ['node', 'relationship'])
    let node = hitItems.find(item => item.type === 'node')
    let rel = hitItems.find(item => item.type === 'relationship')

    const rect = this.canvas.getBoundingClientRect()
    const pos = getMousePosition(evt, { state: this.panZoomState, canvas: this.canvas })
    const pointer = {
      DOM: {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      },
      canvas: {
        x: pos.x,
        y: pos.y
      }
    }

    this.parentHandler.callIfRegistered('contextActivated', {
      pointer: pointer,
      node: node ? node.id : undefined,
      relationship: rel ? rel.id : undefined
    })

    evt.preventDefault()
  }

  _getTargetItems (evt, targets = ['node']) {
    const pos = getMousePosition(evt, { state: this.panZoomState, canvas: this.canvas })
    // const node = this._layout.getNodeAtPoint(pos)
    const node = null
    return node ? [node] : []
  }

  _getTargetItem (evt, targets = ['node']) {
    let hitItems = this._getTargetItems(evt, targets)

    if (hitItems.length > 0) {
      return hitItems[0]
    } else {
      return null
    }
  }
}

const getMousePosition = (evt, context) => {
  const { canvas, state } = context
  let rect = canvas.getBoundingClientRect()
  let devicePixelRatio = window.devicePixelRatio || 1
  let canvasPosition = new Point(
    evt.clientX - rect.left - rect.width * 0.5,
    evt.clientY - rect.top - rect.height * 0.5
  ).scale(devicePixelRatio / state.zoom)

  return canvasPosition.translate(state.pan)
}
