import {createSelector} from "reselect";
import VisualNode from "../graphics/VisualNode";
import VisualEdge from "../graphics/VisualEdge";
import VisualGraph from "../graphics/VisualGraph";
import TransformationHandles from "../graphics/TransformationHandles";
import {bundle} from "../model/graph/relationshipBundling";
import {RoutedRelationshipBundle} from "../graphics/RoutedRelationshipBundle";
import NodeToolboxes from "../graphics/NodeToolboxes";
import { ViewTransformation } from "../state/ViewTransformation";
import { calculateViewportTranslation } from "../middlewares/viewportMiddleware";

const getSelection = (state) => state.selection
const getViewTransformation = (state) => state.viewTransformation

export const getGraph = (state) => {
  const { layers } = state.applicationLayout

  if (layers.length > 0) {
    const newState = layers.reduce((resultState, layer) => {
      if (layer.selector) {
        return layer.selector(resultState)
      } else {
        return resultState
      }
    }, state)
    return newState.graph
  } else {
    return state.graph
  }
}

export const getChildViewTransformation = (state) => new ViewTransformation(
  state.viewTransformation.scale * (400 / state.applicationLayout.windowSize.width)
)

export const getVisualGraph = createSelector(
  [getGraph, getSelection, getViewTransformation],
  (graph, selection, viewTransformation) => {
    const visualNodes = graph.nodes.reduce((nodeMap, node) => {
      nodeMap[node.id] = new VisualNode(node, viewTransformation, graph)
      return nodeMap
    }, {})

    const visualRelationships = graph.relationships.map(relationship =>
      new VisualEdge(
        relationship,
        visualNodes[relationship.fromId],
        visualNodes[relationship.toId],
        selection.selectedRelationshipIdMap[relationship.id],
        graph),
    )
    const relationshipBundles = bundle(visualRelationships).map(bundle => {
      return new RoutedRelationshipBundle(bundle, viewTransformation, graph);
    })

    return new VisualGraph(graph, visualNodes, relationshipBundles)
  }
)



export const getVisualGraphForSelectedCluster = createSelector(
  [getGraph, getSelection, getChildViewTransformation],
  (graph, selection, viewTransformation) => {
    let superNode = graph.nodes.find(node => selection.selectedNodeIdMap[node.id] && node.type === 'super')

    if (superNode) {
      const childNodes = graph.nodes.reduce((nodes, node) => {
        const subNodePosition = superNode.initialPositions.find(ip => ip.nodeId === node.id)
        if (subNodePosition) {
          const subNode = { ...node, status: null, position: subNodePosition.position }
          nodes.push(subNode)
        }
        return nodes
      }, [])

      const { scale, translateVector } = calculateViewportTranslation(childNodes, 50, { width: 400, height: 300 })
      const adjustedViewTransformation = new ViewTransformation(scale, translateVector)

      const nodes = childNodes.reduce((nodes, node) => {
        nodes[node.id] = new VisualNode(node, adjustedViewTransformation, graph)
        return nodes
      }, {})

      const relationships = graph.relationships.filter(relationship => nodes[relationship.fromId] && nodes[relationship.toId])
        .map(relationship =>
          new VisualEdge(
            relationship,
            nodes[relationship.fromId],
            nodes[relationship.toId],
            selection.selectedRelationshipIdMap[relationship.id],
            graph),
        )
      const relationshipBundles = bundle(relationships).map(bundle => {
        return new RoutedRelationshipBundle(bundle, adjustedViewTransformation, graph);
      })

      return new VisualGraph(graph, nodes, relationshipBundles)
    } else {
      return new VisualGraph(graph, {}, [])
    }
  }
)

export const getTransformationHandles = createSelector(
  [getGraph, getSelection, getViewTransformation],
  (graph, selection, viewTransformation) => {
    return new TransformationHandles(graph, selection, viewTransformation)
  }
)

export const getToolboxes = createSelector(
  [getGraph],
  (graph) => {
    return new NodeToolboxes(graph)
  }
)