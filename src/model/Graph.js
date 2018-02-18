import Node from './Node'
import Relationship from "./Relationship";
import * as uuid from "uuid";
/*
 * Graph data-structure that's intended to be used immutably: please remember not to modify any of the internal arrays;
 * make a new graph object instead.
 */
export class Graph {
  constructor(nodes = [], relationships = []) {
    this.nodes = nodes
    this.relationships = relationships
  }

  createNode() {
    let newNodes = this.nodes.slice();
    newNodes.push(new Node())
    return new Graph(newNodes, this.relationships)
  }

  createNodeAndRelationship(sourceNodeId, targetNodePosition) {

  }

  connectNodes(sourceNodeId, targetNodeId) {
    const newRelationships = this.relationships.slice();
    newRelationships.push(new Relationship({
      id: {
        type: 'SYNTHETIC',
        value: uuid()
      },
      type: '_RELATED',
      properties: {}
    }, sourceNodeId.value, targetNodeId.value))
    return new Graph(this.nodes, newRelationships)
  }

  moveNode(nodeId, newPosition) {
    return new Graph(this.nodes.map((node) => node.idMatches(nodeId) ? node.moveTo(newPosition) : node), this.relationships)
  }

  closestNode(point, nodeTest) {
    let closestDistance = Number.POSITIVE_INFINITY
    let closestNode = null
    this.nodes.forEach((node) => {
      const distance = node.position.vectorFrom(point).distance()
      if (distance < closestDistance && nodeTest(node, distance)) {
        closestDistance = distance
        closestNode = node
      }
    })
    return closestNode
  }

  nodeAtPoint(point) {
    return this.closestNode(point, (node, distance) => distance < node.radius)
  }

  nodeRingAtPoint(point) {
    return this.closestNode(point, (node, distance) => distance > node.radius && distance < node.radius + 10)
  }
}