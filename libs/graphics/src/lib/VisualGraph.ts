import {Point, relationshipHitTolerance, ringMargin} from "@neo4j-arrows/model";
import {BoundingBox, combineBoundingBoxes} from "./utils/BoundingBox";
import {Graph,Node} from "@neo4j-arrows/model";
import { VisualNode } from "./VisualNode";
import { RoutedRelationshipBundle } from "./RoutedRelationshipBundle";
import { VisualRelationship } from "./VisualRelationship";
import { ResolvedRelationship } from "./ResolvedRelationship";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DisplayOptions } from "./utils/DisplayOptions";
import { DrawingContext } from "./utils/DrawingContext";

export type NodeHitTestFn = (node:VisualNode, distance:number) => boolean
export type RelationshipHitTestFn = (node:VisualRelationship, distance:number) => boolean

export class VisualGraph {
  constructor(readonly graph:Graph, readonly nodes:Record<string, VisualNode>, readonly relationshipBundles:RoutedRelationshipBundle[]) {}

  get style () {
    return this.graph.style
  }

  entityAtPoint(point:Point) {
    const node = this.nodeAtPoint(point)
    if (node) return { ...node, entityType: 'node' }

    const nodeRing = this.nodeRingAtPoint(point)
    if (nodeRing) return { ...nodeRing, entityType: 'nodeRing' }

    const relationship = this.relationshipAtPoint(point)
    if (relationship) return { ...relationship, entityType: 'relationship' }

    return null
  }

  nodeAtPoint(point:Point) {
    return this.closestNode(point, (visualNode:VisualNode, distance:number) => {
      return distance < visualNode.radius
    })
  }

  nodeRingAtPoint(point:Point) {
    return this.closestNode(point, (visualNode:VisualNode, distance:number) => {
      const nodeRadius = visualNode.radius
      return distance > nodeRadius && distance < nodeRadius + ringMargin
    })
  }

  entitiesInBoundingBox(boundingBox:BoundingBox) {
    const nodes = this.graph.nodes.filter(node => boundingBox.contains(node.position))
      .map(node => ({ ...node, entityType: 'node' }))
    const relationships = this.relationshipBundles.flatMap(bundle => bundle.routedRelationships)
      .filter(routedRelationship => boundingBox.contains(routedRelationship.arrow.midPoint()))
      .map(routedRelationship => routedRelationship.resolvedRelationship)
      .map(relationship => ({ ...relationship, entityType: 'relationship' }))

    return [...nodes, ...relationships]
  }

  closestNode(point:Point, hitTest:NodeHitTestFn):Node|null {
    let closestDistance = Number.POSITIVE_INFINITY
    let closestNode:Node | null = null
    this.graph.nodes.filter(node => node.status !== 'combined').forEach((node) => {
      const visualNode = this.nodes[node.id]
      const distance = visualNode.distanceFrom(point)
      if (distance < closestDistance && hitTest(visualNode, distance)) {
        closestDistance = distance
        closestNode = node
      }
    })
    return closestNode
  }

  relationshipAtPoint(point:Point) {
    return this.closestRelationship(point, (relationship, distance) => distance <= relationshipHitTolerance)
  }

  closestRelationship(point:Point, hitTest:RelationshipHitTestFn):ResolvedRelationship | null {
    let minDistance = Number.POSITIVE_INFINITY
    let closestRelationship: ResolvedRelationship | null = null
    this.relationshipBundles.forEach(bundle => {
      bundle.routedRelationships.forEach(routedRelationship => {
        const distance = routedRelationship.distanceFrom(point)
        if (distance < minDistance && hitTest(routedRelationship, distance)) {
          minDistance = distance
          closestRelationship = routedRelationship.resolvedRelationship
        }
      })
    })

    return closestRelationship
  }

  draw(ctx:DrawingContext, displayOptions:DisplayOptions) {
    ctx.save()
    const viewTransformation = displayOptions.viewTransformation
    ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy)
    ctx.scale(viewTransformation.scale)
    this.relationshipBundles.forEach(bundle => bundle.draw(ctx))
    Object.values(this.nodes).forEach(visualNode => {
      visualNode.draw(ctx)
    })
    ctx.restore()
  }

  boundingBox() {
    const nodeBoxes = Object.values(this.nodes).map(node => node.boundingBox())
    const relationshipBoxes = Object.values(this.relationshipBundles).map(bundle => bundle.boundingBox())
    return combineBoundingBoxes([...nodeBoxes, ...relationshipBoxes])
  }
}