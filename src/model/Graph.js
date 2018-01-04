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

  moveNode(node, position) {
    let newNodes = []
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] === node) {
        newNodes[i] = new Node(position)
      } else {
        newNodes[i] = this.nodes[i]
      }
    }
    return new Graph(newNodes)
  }
}