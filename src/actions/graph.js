import {snapToNeighbourDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";
import {idsMatch, nextAvailableId} from "../model/Id";
import {Point} from "../model/Point";
import { blueActive } from "../model/colors";
import { defaultNodeRadius } from "../graphics/constants";
import { calculateBoundingBox } from "../graphics/utils/geometryUtils";
import { calculateViewportTranslation } from "../middlewares/viewportMiddleware";

export const createNode = () => (dispatch, getState) => {
  const { viewTransformation, windowSize } = getState()
  const randomPosition = new Point(Math.random() * windowSize.width, Math.random() * windowSize.height)

  dispatch({
    category: 'GRAPH',
    type: 'CREATE_NODE',
    newNodeId: nextAvailableId(getState().graph.nodes),
    newNodePosition: viewTransformation.inverse(randomPosition),
    caption: ''
  })
}

export const createNodeAndRelationship = (sourceNodeId, targetNodePosition) => (dispatch, getState) => {
  dispatch({
    category: 'GRAPH',
    type: 'CREATE_NODE_AND_RELATIONSHIP',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId: nextAvailableId(getState().graph.nodes),
    targetNodePosition,
    caption: ''
  })
}

export const connectNodes = (sourceNodeId, targetNodeId) => (dispatch, getState) => {
  dispatch({
    category: 'GRAPH',
    type: 'CONNECT_NODES',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId
  })
}

export const tryMoveNode = (nodeId, oldMousePosition, newMousePosition) => {
  return function (dispatch, getState) {
    const { graph, viewTransformation, windowSize } = getState()
    let translateMultiplier = 1

    const vector = newMousePosition.vectorFrom(oldMousePosition).scale(1 / viewTransformation.scale)
    vector.dx *= translateMultiplier

    const activelyMovedNode = graph.nodes.find((node) => idsMatch(node.id, nodeId))
    const otherSelectedNodes = Object.keys(getState().selection.selectedNodeIdMap).filter((selectedNodeId) => selectedNodeId !== nodeId)
    let currentPosition = getState().guides.naturalPosition || activelyMovedNode.position


    let naturalPosition = currentPosition.translate(vector)
    let snaps = snapToNeighbourDistancesAndAngles(graph, nodeId, naturalPosition, otherSelectedNodes)

    let guides = new Guides()
    let newPosition = naturalPosition
    if (snaps.snapped) {
      guides = new Guides(snaps.guidelines, naturalPosition)
      newPosition = snaps.snappedPosition
    }
    const delta = newPosition.vectorFrom(activelyMovedNode.position)
    const nodePositions = [{
      nodeId,
      position: newPosition
    }]
    otherSelectedNodes.forEach((otherNodeId) => {
      nodePositions.push({
        nodeId: otherNodeId,
        position: graph.nodes.find((node) => idsMatch(node.id, otherNodeId)).position.translate(delta)
      })
    })

    // TO ANTICIPATE VIEWPORT ADJUST AND ACT

   /*const nodes = graph.nodes.map(node => ({ id: node.id, position: node.position, style: node.style }))
    let movedNodePosition
    nodePositions.forEach(nodePosition => {
      const node = nodes.find(node => node.id === nodePosition.nodeId)
      if (node.position.x !== nodePosition.position.x || node.position.y !== nodePosition.position.y) {
        console.log('UPDATING POSITION AT TRY MOVE NODE')
        node.position = nodePosition.position
        if (nodePosition.nodeId === activelyMovedNode.id) {
          movedNodePosition = nodePosition
        }
      }
    })

    let { scale, translateVector } = calculateViewportTranslation(nodes, graph.style.radius, windowSize)

    if (scale && scale < 1 && scale < viewTransformation.scale) {
      const scaleChange = viewTransformation.scale / scale
      // console.log('OLD SCALE, NEW SCALE', scaleChange)
      console.log('translateVector',scaleChange, translateVector, viewTransformation.offset)
      const differenceVector = translateVector.minus(viewTransformation.offset)

      if (movedNodePosition) {
        console.log('ADJUSTING MOVED NODE', differenceVector.distance())
        movedNodePosition.position = movedNodePosition.position.translate(delta.scale(5)) // translate(differenceVector) // ??.translate(delta.scale(2))
      }
    }*/

    dispatch(moveNodes(oldMousePosition, newMousePosition, nodePositions, guides))
  }
}

export const moveNodes = (oldMousePosition, newMousePosition, nodePositions, guides, autoGenerated) => {
  return {
    category: 'GRAPH',
    type: 'MOVE_NODES',
    oldMousePosition,
    newMousePosition,
    nodePositions,
    guides,
    autoGenerated
  }
}

export const moveNodesEndDrag = (nodePositions) => {
  return {
    category: 'GRAPH',
    type: 'MOVE_NODES_END_DRAG',
    nodePositions
  }
}

export const setNodeCaption = (selection, caption) => ({
  category: 'GRAPH',
  type: 'SET_NODE_CAPTION',
  selection,
  caption
})

export const renameProperty = (selection, oldPropertyKey, newPropertyKey) => ({
  category: 'GRAPH',
  type: 'RENAME_PROPERTY',
  selection,
  oldPropertyKey,
  newPropertyKey
})

export const setProperty = (selection, key, value) => ({
  category: 'GRAPH',
  type: 'SET_PROPERTY',
  selection,
  key,
  value
})

export const setArrowsProperty = (selection, key, value) => ({
  category: 'GRAPH',
  type: 'SET_ARROWS_PROPERTY',
  selection,
  key,
  value
})

export const removeProperty = (selection, key) => ({
  category: 'GRAPH',
  type: 'REMOVE_PROPERTY',
  selection,
  key
})

export const removeArrowsProperty = (selection, key) => ({
  category: 'GRAPH',
  type: 'REMOVE_ARROWS_PROPERTY',
  selection,
  key
})


export const setRelationshipType = (selection, relationshipType) => ({
  category: 'GRAPH',
  type: 'SET_RELATIONSHIP_TYPE',
  selection,
  relationshipType
})

export const deleteNodesAndRelationships = (nodeIdMap, relationshipIdMap) => ({
  category: 'GRAPH',
  type: 'DELETE_NODES_AND_RELATIONSHIPS',
  nodeIdMap,
  relationshipIdMap
})

export const deleteSelection = () => {
  return function (dispatch, getState) {
    const selection = getState().selection
    const relationships = getState().graph.relationships

    const nodeIdMap = {...selection.selectedNodeIdMap}
    const relationshipIdMap = {...selection.selectedRelationshipIdMap}

    relationships.forEach(relationship => {
      if (!relationshipIdMap[relationship.id] && (nodeIdMap[relationship.fromId] || nodeIdMap[relationship.toId])) {
        relationshipIdMap[relationship.id] = true
      }
    })

    dispatch(deleteNodesAndRelationships(nodeIdMap, relationshipIdMap))
  }
}