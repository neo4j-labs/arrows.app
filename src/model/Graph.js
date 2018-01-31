import { Node } from './Node'
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

  moveNode(nodeId, newPosition) {
    return new Graph(this.nodes.map((node) => node.idMatches(nodeId) ? node.moveTo(newPosition) : node), this.relationships)
  }
}