export const selectedNodes = (graph, selection) => {
  return graph.nodes.filter((node) => selection.selectedNodeIdMap[node.id])
}

export const selectedRelationships = (graph, selection) => {
  return graph.relationships.filter((node) => selection.selectedRelationshipIdMap[node.id])
}

export const describeSelection = (selection) => {
  const parts = []
  const pushSelectionPart = (map, entityType) => {
    const length = Object.keys(map).length
    switch (length) {
      case 0:
        break

      case 1:
        parts.push('1 ' + entityType)
        break

      default:
        parts.push(length + ' ' + entityType + 's')
    }
  }

  pushSelectionPart(selection.selectedNodeIdMap, "node")
  pushSelectionPart(selection.selectedRelationshipIdMap, "relationship")

  if (parts.length > 0) {
    return 'Selection: ' + parts.join(', ')
  } else {
    return 'Nothing selected'
  }
}
