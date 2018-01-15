import {drawGuideline, drawNode, drawRelationships} from "../graphics/canvasRenderer";
import config from './config'

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { graph, guides } = visuals
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  guides.guidelines.forEach((guideline) => {
    drawGuideline(ctx, guideline, displayOptions.canvasSize.width, displayOptions.canvasSize.height)
  })

  if (guides.naturalPosition) {
    drawNode(ctx, displayOptions.viewTransformation.transform(guides.naturalPosition), 'grey', 50)
  }

  graph.nodes.forEach((node) => {
    drawNode(ctx, displayOptions.viewTransformation.transform(node.position), '#53acf3', 50)
  })

  drawRelationships(ctx, graph, config, displayOptions)
}