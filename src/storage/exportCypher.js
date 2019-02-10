export const exportCypher = (graph, keyword, includeStyling) => {
  const captionMap = {}
  graph.nodes.forEach(node => {
    if (node.caption) {
      if (captionMap[node.caption]) {
        captionMap[node.caption].push(node)
      } else {
        captionMap[node.caption] = [node]
      }
    }
  })
  const idMap = {}
  graph.nodes.forEach(node => {
    if (node.caption && captionMap[node.caption].length === 1) {
      idMap[node.id] = node.caption
    } else {
      idMap[node.id] = node.id
    }
  })
  return [
    ...graph.nodes.map(node => {
      const labels = node.labels.map(label => `:${label}`).join('')
      return `${keyword} (${idMap[node.id]}${labels})`;
    }),
    ...graph.relationships.map(relationship => {
      let type = relationship.type || '_RELATED'
      if (type === '_RELATED' && keyword === 'MATCH') {
        type = null
      }
      const relationshipSpec = type ? `[:${type}]` : ''
      return `${keyword} (${idMap[relationship.fromId]})-${relationshipSpec}->(${idMap[relationship.toId]})`;
    })
  ].join('\n')
}