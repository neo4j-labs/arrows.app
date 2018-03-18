export const selectedNodes = (graph, selection) => {
  return graph.nodes.filter((node) => selection.selectedNodeIdMap[node.id])
}