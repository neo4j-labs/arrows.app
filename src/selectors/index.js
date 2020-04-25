import {createSelector} from "reselect";
import VisualNode from "../graphics/VisualNode";
import ResolvedRelationship from "../graphics/ResolvedRelationship";
import VisualGraph from "../graphics/VisualGraph";
import TransformationHandles from "../graphics/TransformationHandles";
import {bundle} from "../model/graph/relationshipBundling";
import {RoutedRelationshipBundle} from "../graphics/RoutedRelationshipBundle";
import CanvasAdaptor from "../graphics/utils/CanvasAdaptor";
import {nodeEditing, relationshipSelected, selectedNodeIds} from "../model/selection";

const getSelection = (state) => state.selection
const getViewTransformation = (state) => state.viewTransformation

export const getPresentGraph = state => state.graph.present || state.graph

export const getGraph = (state) => {
  const { layers } = state.applicationLayout || { }

  if (layers && layers.length > 0) {
    const newState = layers.reduce((resultState, layer) => {
      if (layer.selector) {
        return layer.selector({ graph: resultState, [layer.name]: state[layer.name] })
      } else {
        return resultState
      }
    }, getPresentGraph(state))
    return newState
  } else {
    return getPresentGraph(state)
  }
}

export const measureTextContext = (() => {
  const canvas = window.document.createElement('canvas')
  return new CanvasAdaptor(canvas.getContext('2d'))
})()

export const getVisualGraph = createSelector(
  [getGraph, getSelection],
  (graph, selection) => {
    const visualNodes = graph.nodes.reduce((nodeMap, node) => {
      nodeMap[node.id] = new VisualNode(
        node,
        graph,
        nodeEditing(selection, node.id),
        measureTextContext
      )
      return nodeMap
    }, {})

    const visualRelationships = graph.relationships.map(relationship =>
      new ResolvedRelationship(
        relationship,
        visualNodes[relationship.fromId],
        visualNodes[relationship.toId],
        relationshipSelected(selection, relationship.id),
        graph),
    )
    const relationshipBundles = bundle(visualRelationships).map(bundle => {
      return new RoutedRelationshipBundle(bundle, graph);
    })

    return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
  }
)

export const getTransformationHandles = createSelector(
  [getVisualGraph, getSelection, getViewTransformation],
  (visualGraph, selection, viewTransformation) => {
    return new TransformationHandles(visualGraph, selection, viewTransformation)
  }
)

export const getPositionsOfSelectedNodes = createSelector(
  [getVisualGraph, getSelection],
  (visualGraph, selection) => {
    const nodePositions = []
    selectedNodeIds(selection).forEach((nodeId) => {
      const visualNode = visualGraph.nodes[nodeId]
      nodePositions.push({
        nodeId: visualNode.id,
        position: visualNode.position,
        radius: visualNode.radius
      })
    })
    return nodePositions
  }
)