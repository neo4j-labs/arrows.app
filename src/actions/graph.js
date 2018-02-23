import {snapToNeighbourDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";

export const END_DRAG = 'END_DRAG'
export const UPDATE_NODE_PROPERTIES = 'UPDATE_NODE_PROPERTIES'

export const createNode = () => {
  return {
    type: 'CREATE_NODE'
  }
}

const createNodeAndRelationship = (sourceNodeId, targetNodePosition) => {
  return {
    type: 'CREATE_NODE_AND_RELATIONSHIP',
    sourceNodeId,
    targetNodePosition
  }
}

const connectNodes = (sourceNodeId, targetNodeId) => {
  return {
    type: 'CONNECT_NODES',
    sourceNodeId,
    targetNodeId,
  }
}

export const tryMoveNode = (nodeId, vector) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let currentPosition = getState().guides.naturalPosition || graph.nodes.find((node) => node.idMatches(nodeId)).position
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
  type: UPDATE_NODE_PROPERTIES,
  nodeId,
  properties
})