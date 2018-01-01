import { Node } from './Node'
/*
 * Immutable graph data-structure
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
}