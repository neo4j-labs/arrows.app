import EdgeBundle from './EdgeBundle'
import {asKey} from "../model/Id";
import { getDistanceToBezierEdge } from "./utils/geometryUtils";
import { relationshipHitTolerance } from "./constants";
import {nodeAtPoint, nodeRingAtPoint} from "../model/Graph";
import { drawAnnotation } from "./Annotation";

export default class VisualGraph {
  constructor(graph, nodes, edges) {
    this.graph = graph
    this.nodes = nodes
    this.edges = edges
    VisualGraph.constructEdgeBundles(this.edges)
  }

  get style () {
    return this.graph.style
  }

  static constructEdgeBundles(edges) {
    edges.reduce((edgeBundleList, edge) => {
      let edgeBundle = edgeBundleList[`${asKey(edge.from.id)}-${asKey(edge.to.id)}`]
        || edgeBundleList[`${asKey(edge.to.id)}-${asKey(edge.from.id)}`]
      if (!edgeBundle) {
        edgeBundle = new EdgeBundle(edge)
        edgeBundleList[`${asKey(edge.from.id)}-${asKey(edge.to.id)}`] = edgeBundle
      } else {
        edgeBundle.addEdge(edge)
      }
      edge.edgeBundle = edgeBundle
      return edgeBundleList
    }, {})
    edges.forEach(edge => edge.updateEndPoints())
  }

  entityAtPoint(canvasPosition, graphPosition) {
    const node = nodeAtPoint(this.graph, graphPosition)
    if (node) return { ...node, entityType: 'node' }

    const nodeRing = nodeRingAtPoint(this.graph, graphPosition)
    if (nodeRing) return { ...nodeRing, entityType: 'nodeRing' }

    const relationship = this.relationshipAtPoint(canvasPosition)
    if (relationship) return { ...relationship, entityType: 'relationship' }

    return null
  }

  relationshipAtPoint(point) {
    return this.closestRelationship(point, (relationship, distance) => distance <= relationshipHitTolerance)
  }

  closestRelationship(point, hitTest) {
    let minDistance = Number.POSITIVE_INFINITY
    let closestRelationship = null
    this.edges.forEach(relationship => {
      const from = relationship.from
      const to = relationship.to
      const distance = getDistanceToBezierEdge(from.x, from.y, to.x, to.y, point.x, point.y, relationship.viaCoordinates)
      if (distance < minDistance && hitTest(relationship, distance)) {
        minDistance = distance
        closestRelationship = relationship
      }
    })
    return closestRelationship
  }

  draw(ctx) {
    this.edges.forEach(edge => edge.draw(ctx))
    Object.values(this.nodes).forEach(visualNode => {
      visualNode.draw(ctx)
      if (visualNode.node.properties) {
        drawAnnotation(ctx, visualNode)
      }
    })
  }

}