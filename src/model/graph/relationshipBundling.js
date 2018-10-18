class NodePair {
  constructor(node1, node2) {
    if (node1.id < node2.id) {
      this.nodeA = node1
      this.nodeB = node2
    } else {
      this.nodeA = node2
      this.nodeB = node1
    }
  }

  key() {
    return `${this.nodeA.id}:${this.nodeB.id}`
  }
}

export const bundle = (relationships) => {
  const bundles = {}
  relationships.forEach(r => {
    const nodePair = new NodePair(r.from, r.to)
    const bundle = bundles[nodePair.key()] || (bundles[nodePair.key()] = [])
    bundle.push(r)
  })
  return Object.values(bundles)
}
