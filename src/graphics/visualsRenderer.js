import {drawGuideline, drawGraph, drawRing, drawStraightArrow} from "./canvasRenderer";
import config from './config'

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { graph, gestures, guides } = visuals

  const transform = (position) => displayOptions.viewTransformation.transform(position)
  const defaultNodeRadius = 50;
  const defaultNewNodeRadius = 40;
  const ringMargin = 10;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  guides.guidelines.forEach((guideline) => {
    drawGuideline(ctx, guideline, displayOptions)
  })

  if (guides.naturalPosition) {
    // drawNode(ctx, transform(guides.naturalPosition), 'grey', defaultNodeRadius)
  }

  if (gestures.activeRing) {
    const activeRingPosition = graph.nodes.find((node) => node.idMatches(gestures.activeRing)).position;
    if (gestures.newNodePosition) {
      const delta = gestures.newNodePosition.vectorFrom(activeRingPosition)
      let newNodePosition = activeRingPosition;
      let newNodeRadius = defaultNodeRadius + ringMargin;
      if (delta.distance() > defaultNodeRadius + ringMargin) {
        if (delta.distance() < defaultNodeRadius + defaultNewNodeRadius) {
          const ratio = (delta.distance() - defaultNodeRadius - ringMargin) / (defaultNewNodeRadius - ringMargin);
          newNodePosition = activeRingPosition.translate(delta.scale(ratio))
          newNodeRadius = defaultNodeRadius + ringMargin + (defaultNewNodeRadius - defaultNodeRadius - ringMargin) * ratio
        } else {
          newNodePosition = gestures.newNodePosition
          newNodeRadius = defaultNewNodeRadius
        }
      }

      drawRing(ctx, transform(newNodePosition), 'blue', newNodeRadius)
      drawStraightArrow(ctx, transform(gestures.originalPosition), transform(newNodePosition))
    } else {
      drawRing(ctx, transform(activeRingPosition), 'grey', defaultNodeRadius + ringMargin)
    }
  }

  drawGraph(ctx, graph, config, displayOptions)
}