import {snapToNeighbourDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";
import {idsMatch, nextAvailableId} from "../model/Id";
import {Point} from "../model/Point";

export const END_DRAG = 'END_DRAG'

export const createNode = () => (dispatch, getState) => {
  dispatch({
    type: 'CREATE_NODE',
    newNodeId: nextAvailableId(getState().graph.nodes),
    newNodePosition: new Point(1000 * Math.random(), 1000 * Math.random()),
    radius: 50,
    caption: '',
    color: '#53acf3'
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
    color: '#53acf3'
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
    const gestures = getState().gestures;
    if (gestures.sourceNodeId) {
      if (gestures.targetNodeId) {
        dispatch(connectNodes(gestures.sourceNodeId, gestures.targetNodeId))
      } else {
        dispatch(createNodeAndRelationship(gestures.sourceNodeId, gestures.newNodePosition))
      }
    }
    dispatch({
      type: 'END_DRAG'
    })
  }
}

export const updateNodeProperties = (nodeId, properties) => ({
  type: 'UPDATE_NODE_PROPERTIES',
  nodeId,
  properties
})