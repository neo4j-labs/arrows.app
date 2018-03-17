import EdgeBundle from './EdgeBundle'
import {asKey} from "../model/Id";
import { getDistanceToBezierEdge } from "./utils/geometryUtils";
import { relationshipHitTolerance } from "./constants";
import Voronoi from './utils/voronoi'

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

  relationshipAtPoint (graph, point) {
    return this.closestRelationship(graph, point, (relationship, distance) => distance <= relationshipHitTolerance)
  }

  closestRelationship(graph, point, hitTest){
    let minDistance = Number.POSITIVE_INFINITY
    let closestRelationship = null
    this.edges.forEach(relationship => {
      const from = relationship.from
      const to = relationship.to
      const distance = getDistanceToBezierEdge(from.x, from.y, to.x, to.y, point.x, point.y, relationship.viaCoordinates)
      if (distance < minDistance && hitTest(relationship, distance)) {
        minDistance = distance
        closestRelationship = relationship
      }
    })
    return closestRelationship
  }

  getVoronoi () {
    var voronoi = new Voronoi();
    var bbox = {xl: 0, xr: 800, yt: 0, yb: 600}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
    var sites = [ {x: 200, y: 200}, {x: 50, y: 250}, {x: 400, y: 100} /* , ... */ ];

    // a 'vertex' is an object exhibiting 'x' and 'y' properties. The
    // Voronoi object will add a unique 'voronoiId' property to all
    // sites. The 'voronoiId' can be used as a key to lookup the associated cell
    // in diagram.cells.

    this.voronoi = voronoi.compute(sites, bbox);
    return this.voronoi
  }
}