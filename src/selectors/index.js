import {createSelector} from "reselect";
import VisualNode from "../graphics/VisualNode";
import VisualEdge from "../graphics/VisualEdge";
import VisualGraph from "../graphics/VisualGraph";
import TransformationHandles from "../graphics/TransformationHandles";
import {bundle} from "../model/graph/relationshipBundling";
import {RoutedRelationshipBundle} from "../graphics/RoutedRelationshipBundle";

const getGraph = (state) => state.graph
const getSelection = (state) => state.selection
const getViewTransformation = (state) => state.viewTransformation

export const getVisualGraph = createSelector(
  [getGraph, getSelection, getViewTransformation],
  (graph, selection, viewTransformation) => {
    const nodes = graph.nodes.reduce((nodes, node) => {
      nodes[node.id] = new VisualNode(node, viewTransformation, graph)
      return nodes
    }, {})

    const relationships = graph.relationships.map(relationship =>
      new VisualEdge(
        relationship,
        nodes[relationship.fromId],
        nodes[relationship.toId],
        selection.selectedRelationshipIdMap[relationship.id],
        graph),
    )
    const relationshipBundles = bundle(relationships).map(bundle => {
      return new RoutedRelationshipBundle(bundle, viewTransformation, graph);
    })

    return new VisualGraph(graph, nodes, relationshipBundles)
  }
)

export const getTransformationHandles = createSelector(
  [getGraph, getSelection, getViewTransformation],
  (graph, selection, viewTransformation) => {
    return new TransformationHandles(graph, selection, viewTransformation)
  }
)