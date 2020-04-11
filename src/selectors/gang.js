import { drawRing } from "../graphics/canvasRenderer";
import { redActive } from "../model/colors";
import {nodeSelected} from "../model/selection";

export default ({ graph, gangs }) => {
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

export const getGangs = state => state.gangs

const applyCluster = (graph, cluster) => {
  const memberIdsMap = cluster.members.reduce((idMap, member) => {
    idMap[member.nodeId] = member
    return idMap
  }, {})

  cluster.drawRing = (ctx, position, color, outerRadius) => drawRing(ctx, position, redActive, outerRadius)

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

export const selectorForInspection = ({ graph, gangs, selection }) => {
  const simplifiedNodes = gangs.reduce((nodes, gang) => {
    if (nodeSelected(selection, gang.id)) {
      return nodes.concat(gang.members.map(member => graph.nodes.find(node => node.id === member.nodeId)))
    } else {
      return nodes
    }
  }, [])
  return simplifiedNodes
}