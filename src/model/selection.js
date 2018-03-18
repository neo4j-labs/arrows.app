export const selectedNodes = (graph, selection) => {
  return graph.nodes.filter((node) => selection.selectedNodeIdMap[node.id])
}

export const selectedRelationships = (graph, selection) => {
  return graph.relationships.filter((node) => selection.selectedRelationshipIdMap[node.id])
}