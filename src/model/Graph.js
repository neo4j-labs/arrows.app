import { isPointInPolygon } from "../graphics/utils/geometryUtils";

const ringLength =  10

export const emptyGraph = () => {
  return {nodes: [], relationships: []}
}

export const closestNode = (graph, point, nodeTest) => {
  let closestDistance = Number.POSITIVE_INFINITY
  let closestNode = null
  graph.nodes.forEach((node) => {
    const distance = node.position.vectorFrom(point).distance()
    if (distance < closestDistance && nodeTest(node, distance)) {
      closestDistance = distance
      closestNode = node
    }
  })
  return closestNode
}

export const nodeAtPoint = (graph, point) => {
  return closestNode(graph, point, (node, distance) => distance < node.radius)
}

export const nodeRingAtPoint = (graph, point) => {
  return closestNode(graph, point, (node, distance) => {
    return distance > node.radius && distance < node.radius + ringLength
  })
}

export const nodesInsidePolygon = (graph, path) => graph.nodes
  .filter(node => isPointInPolygon(node.position, path))
  .map(node => node.id)
