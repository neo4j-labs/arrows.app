import {getPositionsOfSelectedNodes, getPresentGraph, getTransformationHandles, getVisualGraph} from "../selectors"
import {activateEditing, clearSelection, toggleSelection} from "./selection"
import {connectNodes, createNodesAndRelationships, moveNodesEndDrag, tryMoveHandle, tryMoveNode} from "./graph"
import {adjustViewport} from "./viewTransformation"
import {activateRing, deactivateRing, tryDragRing} from "./dragToCreate"
import {selectItemsInMarquee, setMarquee} from "./selectionMarquee"
import {getEventHandlers} from "../selectors/layers";
import {Point, canvasPadding, computeCanvasSize, subtractPadding} from "@neo4j-arrows/model";
import {Vector} from "@neo4j-arrows/model";
import { DispatchFunction, FixThisType, ImpureFunction } from "../type-patches"
import {BoundingBox, BoxSize} from "@neo4j-arrows/graphics";

const toGraphPosition = (state:FixThisType, canvasPosition:Point) => state.viewTransformation.inverse(canvasPosition)

export const wheel = (canvasPosition:Point, vector:Vector, ctrlKey:boolean) => {
  return function (dispatch:DispatchFunction, getState: ImpureFunction) {
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

const moveTowardCenter = (minScale:number, offset:Vector, boundingBox:BoundingBox, canvasSize:BoxSize) => {
  const dimensions = [
    {component: 'dx' as const, min: 'left' as const, max: 'right' as const, extent: 'width' as const},
    {component: 'dy' as const, min: 'top' as const, max: 'bottom' as const, extent: 'height' as const}
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

const constrainScroll = (boundingBox:BoundingBox, scale:number, effectiveOffset:Vector, canvasSize:BoxSize) => {
  const constrainedOffset = new Vector(effectiveOffset.dx, effectiveOffset.dy)

  const dimensions = [
    {component: 'dx' as const, min: 'left' as const, max: 'right' as const, extent: 'width' as const},
    {component: 'dy' as const, min: 'top' as const, max: 'bottom' as const, extent: 'height' as const}
  ]

  const flip = (tooLarge:boolean, boundary:boolean) => {
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

export const doubleClick = (canvasPosition:Point) => {
  return function (dispatch:DispatchFunction, getState: ImpureFunction) {
    const state = getState()
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)
    const item = visualGraph.entityAtPoint(graphPosition)
    if (item) {
      dispatch(activateEditing(item))
    }
  }
}

export const mouseDown = (canvasPosition:Point, multiSelectModifierKey:boolean) => {
  return function (dispatch:DispatchFunction, getState: ImpureFunction) {
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

const mouseDownOnHandle = (corner:Point, canvasPosition:Point, nodePositions:Point[]) => ({
  type: 'MOUSE_DOWN_ON_HANDLE',
  corner,
  canvasPosition,
  nodePositions
})

export const lockHandleDragType = (dragType:string) => ({
  type: 'LOCK_HANDLE_DRAG_MODE',
  dragType
})

const mouseDownOnNode = (node:FixThisType, canvasPosition:Point, graphPosition:Point) => ({
  type: 'MOUSE_DOWN_ON_NODE',
  node,
  position: canvasPosition,
  graphPosition
})

const mouseDownOnNodeRing = (node:FixThisType, canvasPosition:Point) => ({
  type: 'MOUSE_DOWN_ON_NODE_RING',
  node,
  position: canvasPosition
})

const mouseDownOnCanvas = (canvasPosition:Point, graphPosition:Point) => ({
  type: 'MOUSE_DOWN_ON_CANVAS',
  canvasPosition,
  graphPosition
})

const furtherThanDragThreshold = (previousPosition:Point, newPosition:Point) => {
  const movementDelta = newPosition.vectorFrom(previousPosition)
  return movementDelta.distance() >= 3
}

export const mouseMove = (canvasPosition:Point) => {
  return function (dispatch:DispatchFunction, getState:ImpureFunction) {
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


