import {snapToNeighbourDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";
import {idsMatch, nextAvailableId} from "../model/Id";
import {Point} from "../model/Point";
import { blueActive } from "../model/colors";
import { defaultNodeRadius } from "../graphics/constants";

export const createNode = () => (dispatch, getState) => {
  dispatch({
    type: 'CREATE_NODE',
    newNodeId: nextAvailableId(getState().graph.nodes),
    newNodePosition: new Point(1000 * Math.random(), 1000 * Math.random()),
    caption: '',
    style: { radius: 50, color: blueActive }
  })
}

const createNodeAndRelationship = (sourceNodeId, targetNodePosition) => (dispatch, getState) => {
  dispatch({
    type: 'CREATE_NODE_AND_RELATIONSHIP',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId: nextAvailableId(getState().graph.nodes),
    targetNodePosition,
    caption: '',
    style: { radius: 50, color: blueActive }
  })
}

const connectNodes = (sourceNodeId, targetNodeId) => (dispatch, getState) => {
  dispatch({
    type: 'CONNECT_NODES',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId
  })
}

export const tryMoveNode = (nodeId, oldMousePosition, newMousePosition) => {
  return function (dispatch, getState) {
    const vector = newMousePosition.vectorFrom(oldMousePosition)
    const graph = getState().graph;
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
    dispatch(moveNodes(oldMousePosition, newMousePosition, nodePositions, guides))
  }
}

export const moveNodes = (oldMousePosition, newMousePosition, nodePositions, guides) => {
  return {
    type: 'MOVE_NODES',
    oldMousePosition,
    newMousePosition,
    nodePositions,
    guides
  }
}

export const endDrag = () => {
  return function (dispatch, getState) {
    const dragging = getState().gestures.dragToCreate;
    if (dragging.sourceNodeId) {
      if (dragging.targetNodeId) {
        dispatch(connectNodes(dragging.sourceNodeId, dragging.targetNodeId))
      } else {
        dispatch(createNodeAndRelationship(dragging.sourceNodeId, dragging.newNodePosition))
      }
    }
    dispatch({
      type: 'END_DRAG'
    })
  }
}

export const setNodeCaption = (selection, caption) => ({
  type: 'SET_NODE_CAPTION',
  selection,
  caption
})

export const renameProperties = (selection, oldPropertyKey, newPropertyKey) => ({
  type: 'RENAME_PROPERTY',
  selection,
  oldPropertyKey,
  newPropertyKey
})

export const setProperties = (selection, keyValuePairs) => ({
  type: 'SET_PROPERTIES',
  selection,
  keyValuePairs
})

export const setArrowsProperties = (selection, keyValuePairs) => ({
  type: 'SET_ARROWS_PROPERTIES',
  selection,
  keyValuePairs
})

export const removeProperty = (selection, key) => ({
  type: 'REMOVE_PROPERTY',
  selection,
  key
})

export const setRelationshipType = (selection, relationshipType) => ({
  type: 'SET_RELATIONSHIP_TYPE',
  selection,
  relationshipType
})

export const deleteNodesAndRelationships = (nodeIdMap, relationshipIdMap) => ({
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