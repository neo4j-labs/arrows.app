import {relationshipHitTolerance, ringMargin} from "./constants";
import { closestNode } from "../model/Graph";

export default class VisualGraph {
  constructor(graph, nodes, relationshipBundles) {
    this.graph = graph
    this.nodes = nodes
    this.relationshipBundles = relationshipBundles
  }

  get style () {
    return this.graph.style
  }

  entityAtPoint(point) {
    const node = this.nodeAtPoint(point)
    if (node) return { ...node, entityType: 'node' }

    const nodeRing = this.nodeRingAtPoint(point)
    if (nodeRing) return { ...nodeRing, entityType: 'nodeRing' }

    const relationship = this.relationshipAtPoint(point)
    if (relationship) return { ...relationship, entityType: 'relationship' }

    return null
  }

  nodeAtPoint(point) {
    const nodeMap = this.nodes

    return closestNode(this.graph, point, (node, distance) => {
      const nodeRadius = nodeMap[node.id].radius
      return distance < nodeRadius
    })
  }

  nodeRingAtPoint(point) {
    const nodeMap = this.nodes

    return closestNode(this.graph, point, (node, distance) => {
      const nodeRadius = nodeMap[node.id].radius
      return distance > nodeRadius && distance < nodeRadius + ringMargin
    })
  }

  entitiesInBoundingBox(boundingBox) {
    const nodes = this.graph.nodes.filter(node => boundingBox.contains(node.position))
      .map(node => ({ ...node, entityType: 'node' }))
    const relationships = this.relationshipBundles.flatMap(bundle => bundle.routedRelationships)
      .filter(routedRelationship => boundingBox.contains(routedRelationship.arrow.midPoint()))
      .map(routedRelationship => routedRelationship.relationship)
      .map(relationship => ({ ...relationship, entityType: 'relationship' }))

    return [...nodes, ...relationships]
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

  draw(ctx, displayOptions) {
    ctx.save()
    const viewTransformation = displayOptions.viewTransformation
    ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy)
    ctx.scale(viewTransformation.scale, viewTransformation.scale)
    this.relationshipBundles.forEach(bundle => bundle.draw(ctx))
    Object.values(this.nodes).forEach(visualNode => {
      visualNode.draw(ctx)
    })
    ctx.restore()
  }

  boundingBox() {
    return Object.values(this.nodes)
      .map(node => node.boundingBox())
      .reduce((accumulator, value) => accumulator ? accumulator.combine(value) : value, null)
  }
}