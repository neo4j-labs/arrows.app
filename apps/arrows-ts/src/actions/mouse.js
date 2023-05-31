import {getPositionsOfSelectedNodes, getPresentGraph, getTransformationHandles, getVisualGraph} from "../selectors/"
import {activateEditing, clearSelection, toggleSelection} from "./selection"
import {connectNodes, createNodesAndRelationships, moveNodesEndDrag, tryMoveHandle, tryMoveNode} from "./graph"
import {adjustViewport} from "./viewTransformation"
import {activateRing, deactivateRing, tryDragRing} from "./dragToCreate"
import {selectItemsInMarquee, setMarquee} from "./selectionMarquee"
import {getEventHandlers} from "../selectors/layers";
import {canvasPadding, computeCanvasSize, subtractPadding} from "../model-old/applicationLayout";
import {Vector} from "../model-old/Vector";

const toGraphPosition = (state, canvasPosition) => state.viewTransformation.inverse(canvasPosition)

export const wheel = (canvasPosition, vector, ctrlKey) => {
  return function (dispatch, getState) {
    const state = getState()
    const boundingBox = getVisualGraph(state).boundingBox()
    const currentScale = state.viewTransformation.scale
    const canvasSize = subtractPadding(computeCanvasSize(state.applicationLayout))

    if (ctrlKey) {
      const graphPosition = toGraphPosition(state, canvasPosition)
      const fitWidth = canvasSize.width / boundingBox.width
      const fitHeight = canvasSize.height / boundingBox.height
      const minScale = Math.min(1, fitWidth, fitHeight)
      const scale = Math.max(currentScale * (100 - vector.dy) / 100, minScale)
      const rawOffset = canvasPosition.vectorFrom(graphPosition.scale(scale))
      const constrainedOffset = constrainScroll(boundingBox, scale, rawOffset, canvasSize)
      const shouldCenter = scale <= fitHeight && scale <= fitWidth && vector.dy > 0
      const offset = shouldCenter ? moveTowardCenter(minScale, constrainedOffset, boundingBox, canvasSize) : constrainedOffset
      dispatch(adjustViewport(scale, offset.dx, offset.dy))
    } else {
      const rawOffset = state.viewTransformation.offset.plus(vector.scale(currentScale).invert())
      const offset = constrainScroll(boundingBox, currentScale, rawOffset, canvasSize)
      dispatch(adjustViewport(currentScale, offset.dx, offset.dy))
    }
  }
}

const moveTowardCenter = (minScale, offset, boundingBox, canvasSize) => {
  const dimensions = [
    {component: 'dx', min: 'left', max: 'right', extent: 'width'},
    {component: 'dy', min: 'top', max: 'bottom', extent: 'height'}
  ]

  const [dx, dy] = dimensions.map(d => {
    const currentDisplacement = offset[d.component]
    const centreDisplacement = canvasPadding + canvasSize[d.extent] / 2 - (boundingBox[d.max] + boundingBox[d.min]) * minScale / 2
    const difference = centreDisplacement - currentDisplacement
    if (Math.abs(difference) > 1) {
      return currentDisplacement + difference * 0.1
    }
    return currentDisplacement
  })
  return new Vector(dx, dy)
}

const constrainScroll = (boundingBox, scale, effectiveOffset, canvasSize) => {
  const constrainedOffset = new Vector(effectiveOffset.dx, effectiveOffset.dy)

  const dimensions = [
    {component: 'dx', min: 'left', max: 'right', extent: 'width'},
    {component: 'dy', min: 'top', max: 'bottom', extent: 'height'}
  ]

  const flip = (tooLarge, boundary) => {
    return tooLarge ? !boundary : boundary
  }

  dimensions.forEach(d => {
    const tooLarge = boundingBox[d.extent] * scale > canvasSize[d.extent]
    const min = boundingBox[d.min] * scale + effectiveOffset[d.component]
    if (flip(tooLarge, min < canvasPadding)) {
      constrainedOffset[d.component] = canvasPadding - boundingBox[d.min] * scale
    }
    const max = boundingBox[d.max] * scale + effectiveOffset[d.component]
    if (flip(tooLarge, max > canvasPadding + canvasSize[d.extent])) {
      constrainedOffset[d.component] = canvasPadding + canvasSize[d.extent] - boundingBox[d.max] * scale
    }
  })

  return constrainedOffset
}

export const doubleClick = (canvasPosition) => {
  return function (dispatch, getState) {
    const state = getState()
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)
    const item = visualGraph.entityAtPoint(graphPosition)
    if (item) {
      dispatch(activateEditing(item))
    }
  }
}

export const mouseDown = (canvasPosition, multiSelectModifierKey) => {
  return function (dispatch, getState) {
    const state = getState();
    const visualGraph = getVisualGraph(state)
    const transformationHandles = getTransformationHandles(state)
    const graphPosition = toGraphPosition(state, canvasPosition)

    const handle = transformationHandles.handleAtPoint(canvasPosition)
    if (handle) {
      dispatch(mouseDownOnHandle(handle.corner, canvasPosition, getPositionsOfSelectedNodes(state)))
    } else {
      const item = visualGraph.entityAtPoint(graphPosition)
      if (item) {
        switch (item.entityType) {
          case 'node':
            dispatch(toggleSelection([item], multiSelectModifierKey ? 'xor' : 'at-least'))
            dispatch(mouseDownOnNode(item, canvasPosition, graphPosition))
            break

          case 'relationship':
            dispatch(toggleSelection([item], multiSelectModifierKey ? 'xor' : 'at-least'))
            break

          case 'nodeRing':
            dispatch(mouseDownOnNodeRing(item, canvasPosition))
            break
        }
      } else {
        if (!multiSelectModifierKey) {
          dispatch(clearSelection())
        }
        dispatch(mouseDownOnCanvas(canvasPosition, graphPosition))
      }
    }
  }
}

const mouseDownOnHandle = (corner, canvasPosition, nodePositions) => ({
  type: 'MOUSE_DOWN_ON_HANDLE',
  corner,
  canvasPosition,
  nodePositions
})

export const lockHandleDragType = (dragType) => ({
  type: 'LOCK_HANDLE_DRAG_MODE',
  dragType
})

const mouseDownOnNode = (node, canvasPosition, graphPosition) => ({
  type: 'MOUSE_DOWN_ON_NODE',
  node,
  position: canvasPosition,
  graphPosition
})

const mouseDownOnNodeRing = (node, canvasPosition) => ({
  type: 'MOUSE_DOWN_ON_NODE_RING',
  node,
  position: canvasPosition
})

const mouseDownOnCanvas = (canvasPosition, graphPosition) => ({
  type: 'MOUSE_DOWN_ON_CANVAS',
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
    const dragging = state.gestures.dragToCreate
    const mouse = state.mouse
    const previousPosition = mouse.mousePosition

    const eventHandlers = getEventHandlers(state, 'mouseMove')
    const preventDefault = eventHandlers.reduce((prevented, handler) => handler({
      mouse,
      dispatch
    }) || prevented, false)

    if (!preventDefault) {
      switch (mouse.dragType) {
        case 'NONE':
          const item = visualGraph.entityAtPoint(graphPosition)
          if (item && item.entityType === 'nodeRing') {
            if (dragging.sourceNodeId === null || (dragging.sourceNodeId && item.id !== dragging.sourceNodeId)) {
              dispatch(activateRing(item.id, item.type))
            }
          } else {
            if (dragging.sourceNodeId !== null) {
              dispatch(deactivateRing())
            }
          }
          break

        case 'HANDLE':
        case 'HANDLE_ROTATE':
        case 'HANDLE_SCALE':
          if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
            dispatch(tryMoveHandle({
              dragType: mouse.dragType,
              corner: mouse.corner,
              initialNodePositions: mouse.initialNodePositions,
              initialMousePosition: mouse.initialMousePosition,
              newMousePosition: canvasPosition
            }))
          }
          break

        case 'NODE':
          if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
            dispatch(tryMoveNode({
              nodeId: mouse.node.id,
              oldMousePosition: previousPosition,
              newMousePosition: canvasPosition
            }))
          }
          break

        case 'NODE_RING':
          dispatch(tryDragRing(mouse.node.id, graphPosition))
          break

        case 'CANVAS':
        case 'MARQUEE':
          dispatch(setMarquee(mouse.mouseDownPosition, graphPosition))
          break
      }
    }
  }
}

export const mouseUp = () => {
  return function (dispatch, getState) {
    const state = getState();
    const mouse = state.mouse
    const graph = getPresentGraph(state)

    const eventHandlers = getEventHandlers(state, 'mouseUp')
    const preventDefault = eventHandlers.reduce((prevented, handler) => handler({
      state,
      dispatch
    }) || prevented, false)

    if (!preventDefault) {
      switch (mouse.dragType) {
        case 'MARQUEE':
          dispatch(selectItemsInMarquee())
          break
        case 'HANDLE':
          dispatch(moveNodesEndDrag(getPositionsOfSelectedNodes(state)))
          break
        case 'NODE':
          dispatch(moveNodesEndDrag(getPositionsOfSelectedNodes(state)))
          break
        case 'NODE_RING':
          const dragToCreate = state.gestures.dragToCreate;

          if (dragToCreate.sourceNodeId) {
            if (dragToCreate.targetNodeIds.length > 0) {
              dispatch(connectNodes(
                [dragToCreate.sourceNodeId, ...dragToCreate.secondarySourceNodeIds],
                dragToCreate.targetNodeIds
              ))
            } else if (dragToCreate.newNodePosition) {
              const sourceNodePosition = graph.nodes.find(node => node.id === dragToCreate.sourceNodeId).position
              const targetNodeDisplacement = dragToCreate.newNodePosition.vectorFrom(sourceNodePosition)
              dispatch(createNodesAndRelationships(
                [dragToCreate.sourceNodeId, ...dragToCreate.secondarySourceNodeIds],
                targetNodeDisplacement
              ))
            }
          }
          break
      }
    }

    dispatch(endDrag())
  }
}

export const endDrag = () => {
  return {
    type: 'END_DRAG'
  }
}


