import { isPointInPolygon } from "../graphics/utils/geometryUtils";
import { defaultNodeRadius, defaultFontSize } from "../graphics/constants";
import { blueActive } from "./colors";
import { getStyleSelector } from "../selectors/style";

const ringLength =  10

export const emptyGraph = () => {
  return {
    nodes: [],
    relationships: [],
    style: {
      radius: defaultNodeRadius,
      'node-color': blueActive,
      'border-width': 0,
      'border-color': '#000000',
      'caption-color': '#ffffff',
      'caption-font-size': defaultFontSize,
      'property-color': '#000000',
      'property-font-size': defaultFontSize * (4/5)
    }
  }
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
  return closestNode(graph, point, (node, distance) => distance < getStyleSelector(node, 'radius')(graph))
}

export const nodeRingAtPoint = (graph, point) => {
  return closestNode(graph, point, (node, distance) => {
    const nodeRadius = getStyleSelector(node, 'radius')(graph)
    return distance > nodeRadius && distance < nodeRadius + ringLength
  })
}

export const nodesInsidePolygon = (graph, path) => graph.nodes
  .filter(node => isPointInPolygon(node.position, path))
  .map(node => node.id)