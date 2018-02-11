import config from './config'
import Gestures from "./Gestures";
import VisualNode from "./VisualNode";
import VisualEdge from "./VisualEdge";
import VisualGraph from "./VisualGraph";

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { graph, gestures, guides } = visuals

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  guides.draw(ctx, displayOptions)

  const visualGestures = new Gestures(gestures, graph)
  visualGestures.draw(ctx, displayOptions)

  drawGraph(ctx, graph, config, displayOptions)
}

function drawGraph(ctx, graph, relConfig, displayOptions) {
  const nodes = graph.nodes.reduce((nodes, node) => {
    nodes[node.id.value] = new VisualNode(node, displayOptions.viewTransformation)
    return nodes
  }, {})

  const relationships = graph.relationships.map(relationship =>
    new VisualEdge({
        relationship,
        from: nodes[relationship.fromId],
        to: nodes[relationship.toId]
      },
      relConfig)
  )

  const visualGraph = new VisualGraph(nodes, relationships)
  Object.values(visualGraph.nodes).forEach(node => node.draw(ctx))
  visualGraph.constructEdgeBundles()
  visualGraph.edges.forEach(edge => edge.draw(ctx))

}