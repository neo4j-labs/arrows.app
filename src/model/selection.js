export const selectedNodeIds = (selection) => {
  return selection.entities.filter(entity => entity.entityType === 'node').map(entity => entity.id)
}

export const selectedNodeIdMap = (selection) => {
  const idMap = {}
  selection.entities.filter(entity => entity.entityType === 'node').forEach(entity => {
    idMap[entity.id] = true
  })
  return idMap
}

export const nodeSelected = (selection, nodeId) => {
  return selection.entities.some(entity =>
    entity.entityType === 'node' && entity.id === nodeId
  )
}

export const selectedNodes = (graph, selection) => {
  return graph.nodes.filter(node =>
    selection.entities.some(entity =>
      entity.entityType === 'node' && entity.id === node.id
    )
  )
}

export const selectedRelationshipIds = (selection) => {
  return selection.entities.filter(entity => entity.entityType === 'relationship').map(entity => entity.id)
}

export const selectedRelationshipIdMap = (selection) => {
  const idMap = {}
  selection.entities.filter(entity => entity.entityType === 'relationship').forEach(entity => {
    idMap[entity.id] = true
  })
  return idMap
}

export const relationshipSelected = (selection, relationshipId) => {
  return selection.entities.some(entity =>
    entity.entityType === 'relationship' && entity.id === relationshipId
  )
}


export const selectedRelationships = (graph, selection) => {
  return graph.relationships.filter(node =>
    selection.entities.some(entity =>
      entity.entityType === 'relationship' && entity.id === node.id
    )
  )
}