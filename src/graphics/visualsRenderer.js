import Gestures from "./Gestures";
import {drawAnnotation} from "./Annotation";

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { visualGraph, selection, gestures, guides, handles } = visuals

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  guides.draw(ctx, displayOptions)

  const visualGestures = new Gestures(visualGraph.graph, selection, gestures)
  visualGestures.draw(ctx, displayOptions)

  drawGraph(ctx, visualGraph)

  handles.draw(ctx)
}

function drawGraph(ctx, visualGraph) {
}
