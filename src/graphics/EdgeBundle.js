import {asKey} from "../model/Id";
import {idsMatch} from "../model/Id";
export default class EdgeBundle {
  constructor (edge) {
    this.edges = []
    this.edgeMap = {}
    this.nodes = []

    if (edge) {
      this.addEdge(edge)
    }
  }

  addEdge (edge) {
    this.edges.push(edge)
    this.edgeMap[asKey(edge.id)] = edge

    if (this.nodes.length === 0) {
      this.nodes.push(edge.from)
      this.nodes.push(edge.to)
    }
  }

  getDeflectionMultiplier(edgeId) {
    const edge = this.edgeMap[asKey(edgeId)]

    if (!edge) {
      throw new Error('Edge is not present in the edge bundle ')
    }

    const index = this.edges.indexOf(edge)
    const count = this.edges.length
    const topMostDeflection = -(count - 1) * 0.5
    let deflection = topMostDeflection + index
    const reverse = !idsMatch(edge.from.id, this.nodes[0].id)

    // Edges going the other way will have a opposite normal vector and thus needs to calulate deflection inverted
    if (reverse) {
      deflection *= -1
    }

    return deflection
  }

  get id() {
    if (this.node) {
      return this.node.id
    } else if (this.nodes.length === 2) {
      return `${asKey(this.nodes[0].id)}-${asKey(this.nodes[1])}`
    } else {
      return null
    }
  }

  get isLoop () {
    return this.node
  }
}