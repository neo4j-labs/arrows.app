import {createSelector} from "reselect";
import config from '../graphics/config'
import VisualNode from "../graphics/VisualNode";
import VisualEdge from "../graphics/VisualEdge";
import VisualGraph from "../graphics/VisualGraph";

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
      new VisualEdge({
          relationship,
          from: nodes[relationship.fromId],
          to: nodes[relationship.toId]
        },
        config,
        selection.selectedRelationshipIdMap[relationship.id])
    )

    return new VisualGraph(graph, nodes, relationships)
  }
)