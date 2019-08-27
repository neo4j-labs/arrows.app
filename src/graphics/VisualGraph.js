import { relationshipHitTolerance } from "./constants";
import {nodeAtPoint, nodeRingAtPoint} from "../model/Graph";

export default class VisualGraph {
  constructor(graph, nodes, relationshipBundles, viewTransformation) {
    this.graph = graph
    this.nodes = nodes
    this.relationshipBundles = relationshipBundles
    this.viewTransformation = viewTransformation
  }

  get style () {
    return this.graph.style
  }

  entityAtPoint(graphPosition) {
    const node = nodeAtPoint(this.graph, graphPosition)
    if (node) return { ...node, entityType: 'node' }

    const nodeRing = nodeRingAtPoint(this.graph, graphPosition)
    if (nodeRing) return { ...nodeRing, entityType: 'nodeRing' }

    const relationship = this.relationshipAtPoint(graphPosition)
    if (relationship) return { ...relationship, entityType: 'relationship' }

    return null
  }

  relationshipAtPoint(point) {
    return this.closestRelationship(point, (relationship, distance) => distance <= relationshipHitTolerance)
  }

  closestRelationship(point, hitTest) {
    let minDistance = Number.POSITIVE_INFINITY
    let closestRelationship = null
    this.relationshipBundles.forEach(bundle => {
      bundle.routedRelationships.forEach(routedRelationship => {
        const distance = routedRelationship.distanceFrom(point)
        if (distance < minDistance && hitTest(routedRelationship.relationship, distance)) {
          minDistance = distance
          closestRelationship = routedRelationship.relationship
        }
      })
    })

    return closestRelationship
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.viewTransformation.offset.dx, this.viewTransformation.offset.dy)
    ctx.scale(this.viewTransformation.scale, this.viewTransformation.scale)
    this.relationshipBundles.forEach(bundle => bundle.draw(ctx))
    Object.values(this.nodes).forEach(visualNode => {
      visualNode.draw(ctx)
    })
    ctx.restore()
  }
}