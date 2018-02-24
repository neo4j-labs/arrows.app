import {closestNode} from "../model/Graph";
import {idsMatch} from "../model/Id";

const snapToTargetNode = (graph, excludedNodeId, naturalPosition) => {
  const targetNode = closestNode(graph, naturalPosition, (node, distance) => {
    return !idsMatch(node.id, excludedNodeId) && distance < node.radius
  })

  return {
    snapped: targetNode !== null,
    snappedNodeId: targetNode ? targetNode.id : null,
    snappedPosition: targetNode ? targetNode.position : null
  }
}

export default snapToTargetNode