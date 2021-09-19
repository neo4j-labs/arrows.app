import {createSelector} from "reselect";
import memoize from "memoizee";
import VisualNode from "../graphics/VisualNode";
import ResolvedRelationship from "../graphics/ResolvedRelationship";
import VisualGraph from "../graphics/VisualGraph";
import TransformationHandles from "../graphics/TransformationHandles";
import {bundle} from "../model/graph/relationshipBundling";
import {RoutedRelationshipBundle} from "../graphics/RoutedRelationshipBundle";
import CanvasAdaptor from "../graphics/utils/CanvasAdaptor";
import {nodeEditing, nodeSelected, relationshipSelected, selectedNodeIds} from "../model/selection";
import {computeRelationshipAttachments} from "../graphics/relationshipAttachment";

const getSelection = (state) => state.selection
const getMouse = (state) => state.mouse
const getViewTransformation = (state) => state.viewTransformation

export const getPresentGraph = state => state.graph.present || state.graph

export const getGraph = (state) => {
  const { layers } = state.applicationLayout || { }

  if (layers && layers.length > 0) {
    return layers.reduce((resultState, layer) => {
      if (layer.selector) {
        return layer.selector({ graph: resultState, [layer.name]: state[layer.name] })
      } else {
        return resultState
      }
    }, getPresentGraph(state))
  } else {
    return getPresentGraph(state)
  }
}

export const measureTextContext = (() => {
  const canvas = window.document.createElement('canvas')
  return new CanvasAdaptor(canvas.getContext('2d'))
})()

export const getVisualNode = (() => {
  const factory = (node, graph, selection) => {
    return new VisualNode(
      node,
      graph,
      nodeSelected(selection, node.id),
      nodeEditing(selection, node.id),
      measureTextContext
    )
  }
  return memoize(factory, { max: 10000 })
})()

export const getVisualGraph = createSelector(
  [getGraph, getSelection],
  (graph, selection) => {
    const visualNodes = graph.nodes.reduce((nodeMap, node) => {
      nodeMap[node.id] = getVisualNode(node, graph, selection)
      return nodeMap
    }, {})

    const relationshipAttachments = computeRelationshipAttachments(graph, visualNodes)

    const resolvedRelationships = graph.relationships.map(relationship =>
      new ResolvedRelationship(
        relationship,
        visualNodes[relationship.fromId],
        visualNodes[relationship.toId],
        relationshipAttachments.start[relationship.id],
        relationshipAttachments.end[relationship.id],
        relationshipSelected(selection, relationship.id),
        graph)
    )
    const relationshipBundles = bundle(resolvedRelationships).map(bundle => {
      return new RoutedRelationshipBundle(bundle, graph, selection, measureTextContext);
    })

    return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
  }
)

export const getTransformationHandles = createSelector(
  [getVisualGraph, getSelection, getMouse, getViewTransformation],
  (visualGraph, selection, mouse, viewTransformation) => {
    return new TransformationHandles(visualGraph, selection, mouse, viewTransformation)
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