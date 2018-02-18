import EdgeBundle from './EdgeBundle'
import {asKey} from "../model/Id";

export default class VisualGraph {
  constructor (nodes, edges) {
    this.nodes = nodes
    this.edges = edges
    this.constructEdgeBundles()
  }

  constructEdgeBundles () {
    const edgeBundles = this.edges.reduce((edgeBundleList, edge) => {
      let edgeBundle = edgeBundleList[`${asKey(edge.from.id)}-${asKey(edge.to.id)}`]
        || edgeBundleList[`${asKey(edge.to.id)}-${asKey(edge.from.id)}`]
      if (!edgeBundle) {
        edgeBundle = new EdgeBundle(edge)
        edgeBundleList[`${asKey(edge.from.id)}-${asKey(edge.to.id)}`] = edgeBundle
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