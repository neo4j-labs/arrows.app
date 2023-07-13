import {idsMatch} from "../model-old/Id";

const snapToTargetNode = (visualGraph, excludedNodeId, naturalPosition) => {
  const targetNode = visualGraph.closestNode(naturalPosition, (visualNode, distance) => {
    return !idsMatch(visualNode.id, excludedNodeId) && distance < visualNode.radius
  })

  return {
    snapped: targetNode !== null,
    snappedNodeId: targetNode ? targetNode.id : null,
    snappedPosition: targetNode ? targetNode.position : null
  }
}

export default snapToTargetNode