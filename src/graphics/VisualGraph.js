import EdgeBundle from './EdgeBundle'

export default class VisualGraph {
  constructor (nodes, edges) {
    this.nodes = nodes
    this.edges = edges
    this.constructEdgeBundles()
  }

  constructEdgeBundles () {
    const edgeBundles = this.edges.reduce((edgeBundleList, edge) => {
      let edgeBundle = edgeBundleList[`${edge.from.id}-${edge.to.id}`] || edgeBundleList[`${edge.to.id}-${edge.from.id}`]
      if (!edgeBundle) {
        edgeBundle = new EdgeBundle(edge)
        edgeBundleList[`${edge.from.id}-${edge.to.id}`] = edgeBundle
      } else {
        edgeBundle.addEdge(edge)
      }
      edge.edgeBundle = edgeBundle
      return edgeBundleList
    }, {})

    this.edgeBundles = edgeBundles

    this.edges.forEach(edge => edge.updateEndPoints())
  }
}