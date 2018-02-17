const snapToTargetNode = (graph, excludedNodeId, naturalPosition) => {
  const targetNode = graph.closestNode(naturalPosition, (node, distance) => {
    return !node.idMatches(excludedNodeId) && distance < node.radius
  })

  return {
    snapped: targetNode !== null,
    snappedNodeId: targetNode ? targetNode.id : null,
    snappedPosition: targetNode ? targetNode.position : null
  }
}

export default snapToTargetNode