import {getVisualGraph} from "../selectors/";
import {
  activateRing, clearSelection, deactivateRing, endMarquee, setMarquee, toggleSelection, tryDragRing,
  tryUpdateSelectionPath
} from "./gestures";
import {toggleInspector} from "./sidebar";
import {endDrag, tryMoveNode} from "./graph";
import {pan} from "./viewTransformation";

const LongPressTime = 300

const toGraphPosition = (state, canvasPosition) => state.viewTransformation.inverse(canvasPosition)

export const click = (canvasPosition) => {
  return function (dispatch, getState) {
    const state = getState()
    const mouse = state.mouse
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)

    const item = visualGraph.entityAtPoint(graphPosition)
    if (!mouse.dragging && item === null) {
      dispatch(tryUpdateSelectionPath(canvasPosition, false))
    }
  }
}

export const doubleClick = (canvasPosition) => {
  return function (dispatch, getState) {
    const visualGraph = getVisualGraph(getState())

    const item = visualGraph.entityAtPoint(canvasPosition)
    if (item) {
      dispatch(toggleInspector())
    } else {
      dispatch(tryUpdateSelectionPath(canvasPosition, true))
    }
  }
}

export const mouseDown = (canvasPosition, metaKey) => {
  return function (dispatch, getState) {
    const state = getState();
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)

    const item = visualGraph.entityAtPoint(graphPosition)
    if (item) {
      switch (item.entityType) {
        case 'node':
          dispatch(toggleSelection(item, metaKey))
          dispatch(mouseDownOnNode(item, canvasPosition))
          break

        case 'relationship':
          dispatch(toggleSelection(item, metaKey))
          break

        case 'nodeRing':
          dispatch(mouseDownOnNodeRing(item, canvasPosition))
          break
      }
    } else {
      if (!metaKey) {
        dispatch(clearSelection())
      }
      dispatch(mouseDownOnCanvas(canvasPosition, graphPosition))
    }
  }
}

const mouseDownOnNode = (node, canvasPosition) => ({
  type: 'MOUSE_DOWN_ON_NODE',
  node,
  position: canvasPosition
})

const mouseDownOnNodeRing = (node, canvasPosition) => ({
  type: 'MOUSE_DOWN_ON_NODE_RING',
  node,
  position: canvasPosition
})

const mouseDownOnCanvas = (canvasPosition, graphPosition) => ({
  type: 'MOUSE_DOWN_ON_CANVAS',
  mouseDownTime: Date.now(),
  canvasPosition,
  graphPosition
})

const furtherThanDragThreshold = (previousPosition, newPosition) => {
  const movementDelta = newPosition.vectorFrom(previousPosition)
  return movementDelta.distance() >= 3
}

export const mouseMove = (canvasPosition) => {
  return function (dispatch, getState) {
    const state = getState();
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)
    const dragging = state.gestures.dragging
    const mouse = state.mouse
    const previousPosition = mouse.mousePosition

    switch (mouse.dragType) {
      case 'NONE':
        const item = visualGraph.entityAtPoint(graphPosition)
        if (item && item.entityType === 'nodeRing') {
          if (dragging.sourceNodeId === null || (dragging.sourceNodeId && item.id !== dragging.sourceNodeId)) {
            dispatch(activateRing(item.id))
          }
        } else {
          if (dragging.sourceNodeId !== null) {
            dispatch(deactivateRing())
          }
        }
        break

      case 'NODE':
        if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
          dispatch(tryMoveNode(mouse.node.id, previousPosition, canvasPosition))
        }
        break

      case 'NODE_RING':
        dispatch(tryDragRing(mouse.node.id, graphPosition))
        break

      case 'CANVAS':
        if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
          if (Date.now() - mouse.mouseDownTime > LongPressTime) {
            dispatch(setMarquee(mouse.mouseDownPosition, graphPosition))
          } else {
            dispatch(pan(previousPosition, canvasPosition))
          }
        }
        break

      case 'MARQUEE':
        dispatch(setMarquee(mouse.mouseDownPosition, graphPosition))
        break

      case 'PAN':
        dispatch(pan(previousPosition, canvasPosition))
        break
    }
  }
}

export const mouseUp = () => {
  return function (dispatch, getState) {
    const state = getState();
    const mouse = state.mouse

    switch (mouse.dragType) {
      case 'MARQUEE':
        dispatch(endMarquee())
        break

      default:
        dispatch(endDrag())
    }
  }
}

export const mouseLeave = () => {
  return function (dispatch, getState) {
    const state = getState();
    const mouse = state.mouse

    switch (mouse.dragType) {
      case 'MARQUEE':
        dispatch(endMarquee())
        break

      default:
        dispatch(endDrag())
    }
  }
}


