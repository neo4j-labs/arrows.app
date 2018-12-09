export default (state) => {
  if (!state.gangs || state.gangs.length === 0) {
    return state
  }

  let resultGraph = state.graph

  state.gangs.forEach(gang => {
    switch (gang.type) {
      case 'cluster': {
        resultGraph = applyCluster(resultGraph, gang)
      }
      default:
        break
    }
  })

  return {
    ...state,
    graph: resultGraph
  }
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