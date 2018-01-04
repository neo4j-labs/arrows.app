import { Node } from './Node'
/*
 * Graph data-structure that's intended to be used immutably: please remember not to modify any of the internal arrays;
 * make a new graph object instead.
 */
export class Graph {
  constructor(nodes = []) {
    this.nodes = nodes
  }

  createNode() {
    let newNodes = this.nodes.slice();
    newNodes.push(new Node())
    return new Graph(newNodes)
  }

  moveNode(nodeId, vector) {
    return new Graph(this.nodes.map((node) => node.idMatches(nodeId) ? node.move(vector) : node))
  }
}