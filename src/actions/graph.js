import {snapToNeighbourDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";
import {idsMatch, nextAvailableId} from "../model/Id";
import {Point} from "../model/Point";
import { blueActive } from "../model/colors";
export const END_DRAG = 'END_DRAG'
export const SET_RELATIONSHIP_TYPE = 'SET_RELATIONSHIP_TYPE'

export const createNode = () => (dispatch, getState) => {
  dispatch({
    type: 'CREATE_NODE',
    newNodeId: nextAvailableId(getState().graph.nodes),
    newNodePosition: new Point(1000 * Math.random(), 1000 * Math.random()),
    radius: 50,
    caption: '',
    color: blueActive
  })
}

const createNodeAndRelationship = (sourceNodeId, targetNodePosition) => (dispatch, getState) => {
  dispatch({
    type: 'CREATE_NODE_AND_RELATIONSHIP',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId: nextAvailableId(getState().graph.nodes),
    targetNodePosition,
    radius: 50,
    caption: '',
    color: blueActive
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

export const tryMoveNode = (nodeId, vector) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let currentPosition = getState().guides.naturalPosition || graph.nodes.find((node) => idsMatch(node.id, nodeId)).position
    let naturalPosition = currentPosition.translate(vector)
    let snaps = snapToNeighbourDistancesAndAngles(graph, nodeId, naturalPosition)
    if (snaps.snapped) {
      dispatch(moveNode(nodeId, snaps.snappedPosition, new Guides(snaps.guidelines, naturalPosition)))
    } else {
      dispatch(moveNode(nodeId, naturalPosition, new Guides()))
    }
  }
}

export const moveNode = (nodeId, newPosition, guides) => {
  return {
    type: 'MOVE_NODE',
    nodeId,
    newPosition,
    guides
  }
}

export const endDrag = () => {
  return function (dispatch, getState) {
    const dragging = getState().gestures.dragging;
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

export const setNodeCaption = (nodeId, caption) => ({
  type: 'SET_NODE_CAPTION',
  nodeId,
  caption
})

export const setNodeProperties = (nodeId, keyValuePairs) => ({
  type: 'SET_NODE_PROPERTIES',
  nodeId,
  keyValuePairs
})

export const setRelationshipType = (relationshipId, relationshipType) => ({
  type: SET_RELATIONSHIP_TYPE,
  relationshipId,
  relationshipType
})