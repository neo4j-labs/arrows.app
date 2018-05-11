import Gestures from "./Gestures";
import annotation from "./Annotation";

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { visualGraph, selection, gestures, guides } = visuals

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  guides.draw(ctx, displayOptions)

  const visualGestures = new Gestures(visualGraph.graph, selection, gestures)
  visualGestures.draw(ctx, displayOptions)

  drawGraph(ctx, visualGraph)
}

function drawGraph(ctx, visualGraph) {
  visualGraph.edges.forEach(edge => edge.draw(ctx))
  Object.values(visualGraph.nodes).forEach(visualNode => {
    visualNode.draw(ctx)
    if (visualNode.node.properties) {
      annotation(visualNode).draw(ctx)
    }
  })
}
