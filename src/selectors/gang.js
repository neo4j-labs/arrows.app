export const applyGangs = (graph, gangs, ) => {
  if (!gangs || gangs.length === 0) {
    return graph
  }

  let resultGraph = graph

  gangs.forEach(gang => {
    switch (gang.type) {
      case 'cluster': {
        resultGraph = applyCluster(resultGraph, gang)
      }
      default:
        break
    }
  })

  return resultGraph
}


const applyCluster = (graph, cluster) => {
  const memberIdsMap = cluster.members.reduce((idMap, member) => {
    idMap[member.nodeId] = member
    return idMap
  }, {})

  const nodes = graph.nodes.filter(node => !memberIdsMap[node.id])
  nodes.push(cluster)

  const relationships = graph.relationships
    .filter(relationship => !(memberIdsMap[relationship.fromId] && memberIdsMap[relationship.toId]))
    .map(relationship => {
      if (memberIdsMap[relationship.fromId]) {
        return { ...relationship, fromId: cluster.id }
      } else if (memberIdsMap[relationship.toId]) {
        return { ...relationship, toId: cluster.id }
      } else {
        return relationship
      }
    })

  return {
    nodes,
    relationships,
    style: graph.style
  }
}