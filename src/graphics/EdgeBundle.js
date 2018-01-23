export default class EdgeBundle {
  constructor (edge) {
    this.edges = []
    this.edgeMap = {}
    this.nodeMap = {}
    this.nodes = []

    if (edge) {
      this.addEdge(edge)
    }
  }

  addEdge (edge) {
    this.edges.push(edge)
    this.edgeMap[edge.id] = edge

    if (this.nodes.length === 0) {
      if (edge.from === edge.to) {
        this.node = edge.from
      } else {
        this.nodes.push(edge.from)
        this.nodeMap[edge.from.id] = edge.from
        this.nodes.push(edge.to)
        this.nodeMap[edge.to.id] = edge.to
      }
    }
  }

  getDeflectionMultiplier (edgeId) {
    const edge = this.edgeMap[edgeId]

    if (!edge) {
      throw new Error('Edge is not present in the edge bundle ')
    }

    const index = this.edges.indexOf(edge)
    const count = this.edges.length
    const topMostDeflection = -(count - 1) * 0.5
    let deflection = topMostDeflection + index
    const reverse = edge.from.id !== this.nodes[0].id

    // Edges going the other way will have a opposite normal vector and thus needs to calulate deflection inverted
    if (reverse) {
      deflection *= -1
    }

    return deflection
  }

  get id () {
    if (this.node) {
      return this.node.id
    } else if (this.nodes.length === 2) {
      return `${this.nodes[0].id}-${this.nodes[1]}`
    } else {
      return null
    }
  }

  get isLoop () {
    return this.node
  }
}