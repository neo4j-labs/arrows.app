import {getVisualGraph, getTransformationHandles} from "../selectors/"
import {clearSelection, toggleSelection} from "./selection"
import {showInspector} from "./applicationLayout";
import {connectNodes, createNodeAndRelationship, moveNodesEndDrag, tryMoveNode, tryMoveHandle} from "./graph"
import {adjustViewport, pan, scroll} from "./viewTransformation"
import {activateRing, deactivateRing, tryDragRing} from "./dragToCreate"
import {tryUpdateSelectionPath} from "./selectionPath"
import {selectNodesInMarquee, setMarquee} from "./selectionMarquee"
import {idsMatch} from "../model/Id";
import {getStyleSelector} from "../selectors/style";

const LongPressTime = 300

const toGraphPosition = (state, canvasPosition) => state.viewTransformation.inverse(canvasPosition)

export const wheel = (canvasPosition, vector, ctrlKey) => {
  return function (dispatch, getState) {
      const state = getState()
    if (ctrlKey) {
      const graphPosition = toGraphPosition(state, canvasPosition)
      const scale = Math.max(state.viewTransformation.scale * (100 - vector.dy) / 100, 0.01)
      const offset = canvasPosition.vectorFrom(graphPosition.scale(scale))
      dispatch(adjustViewport(scale, offset.dx, offset.dy))
    } else {
      dispatch(scroll(vector.scale(state.viewTransformation.scale).invert()))
    }
  }
}

export const click = (canvasPosition) => {
  return function (dispatch, getState) {
    const state = getState()
    const mouse = state.mouse
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)

    const item = visualGraph.entityAtPoint(canvasPosition, graphPosition)
    if (!mouse.dragging && item === null) {
      dispatch(tryUpdateSelectionPath(canvasPosition, false))
    }
  }
}

export const doubleClick = (canvasPosition) => {
  return function (dispatch, getState) {
    const state = getState()
    const visualGraph = getVisualGraph(state)
    const graphPosition = toGraphPosition(state, canvasPosition)
    const item = visualGraph.entityAtPoint(canvasPosition, graphPosition)
    if (item) {
      dispatch(showInspector())
    } else {
      dispatch(tryUpdateSelectionPath(canvasPosition, true))
    }
  }
}

export const mouseDown = (canvasPosition, metaKey) => {
  return function (dispatch, getState) {
    const state = getState();
    const visualGraph = getVisualGraph(state)
    const transformationHandles = getTransformationHandles(state)
    const graphPosition = toGraphPosition(state, canvasPosition)

    const handle = transformationHandles.handleAtPoint(canvasPosition)
    if (handle) {
      dispatch(mouseDownOnHandle(handle.corner, canvasPosition, positionsOfSelectedNodes(state)))
    } else {
      const item = visualGraph.entityAtPoint(canvasPosition, graphPosition)
      if (item) {
        switch (item.entityType) {
          case 'node':
            dispatch(toggleSelection(item, metaKey))
            dispatch(mouseDownOnNode(item, canvasPosition, graphPosition))
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
}

const mouseDownOnHandle = (corner, canvasPosition, nodePositions) => ({
  type: 'MOUSE_DOWN_ON_HANDLE',
  corner,
  canvasPosition,
  nodePositions
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
    const dragging = state.gestures.dragToCreate
    const mouse = state.mouse
    const previousPosition = mouse.mousePosition

    switch (mouse.dragType) {
      case 'NONE':
        const item = visualGraph.entityAtPoint(canvasPosition, graphPosition)
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

      case 'HANDLE':
        if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
          dispatch(tryMoveHandle({
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

const positionsOfSelectedNodes = (state) => {
  const graph = state.graph
  const selectedNodes = Object.keys(state.selection.selectedNodeIdMap)
  const nodePositions = []
  selectedNodes.forEach((nodeId) => {
    const node = graph.nodes.find((node) => idsMatch(node.id, nodeId))
    nodePositions.push({
      nodeId: nodeId,
      position: node.position,
      radius: getStyleSelector(node, 'radius')(graph)
    })
  })
  return nodePositions
}

export const mouseUp = () => {
  return function (dispatch, getState) {
    const state = getState();
    const mouse = state.mouse

    switch (mouse.dragType) {
      case 'MARQUEE':
        dispatch(selectNodesInMarquee())
        break

      case 'HANDLE':
      case 'NODE':
        dispatch(moveNodesEndDrag(positionsOfSelectedNodes(state)))
        break

      case 'NODE_RING':
        const dragToCreate = state.gestures.dragToCreate;
        if (dragToCreate.sourceNodeId) {
          if (dragToCreate.targetNodeId) {
            dispatch(connectNodes(dragToCreate.sourceNodeId, dragToCreate.targetNodeId))
          } else {
            dispatch(createNodeAndRelationship(dragToCreate.sourceNodeId, dragToCreate.newNodePosition))
          }
        }
        break
    }
    dispatch(endDrag())
  }
}

export const endDrag = () => {
  return {
    type: 'END_DRAG'
  }
}


