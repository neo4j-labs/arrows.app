import VisualNode from "./VisualNode";
import VisualEdge from "./VisualEdge";
import VisualGraph from "./VisualGraph";
import {Point} from "../model/Point";
import {Vector} from "../model/Vector";

const defaultNodeRadius = 50
const defaultNewNodeRadius = 40
const arrowLength = 10
const arrowWidth = 7

export function drawRing(ctx, position, color, size) {
  drawSolidCircle(ctx, position, color, size)
}

export function drawGraph(ctx, graph, relConfig, displayOptions) {
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
  visualGraph.constructEdgeBundles()
  visualGraph.edges.forEach(edge => edge.draw(ctx))
  Object.values(visualGraph.nodes).forEach(node => node.draw(ctx))
}

export function drawGuideline(ctx, guideline, displayOptions) {
  switch (guideline.type) {
    case 'HORIZONTAL':
      const y = displayOptions.viewTransformation.transform(new Point(0, guideline.y)).y
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(displayOptions.canvasSize.width, y)
      ctx.stroke()
      ctx.closePath()
      break

    case 'VERTICAL':
      const x = displayOptions.viewTransformation.transform(new Point(guideline.x, 0)).x
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, displayOptions.canvasSize.height)
      ctx.stroke()
      ctx.closePath()
      break

    case 'CIRCLE':
      ctx.beginPath()
      drawCircle(ctx, displayOptions.viewTransformation.transform(guideline.center), guideline.radius)
      ctx.stroke()
      ctx.closePath()
  }
}

export function drawSolidCircle (ctx, position, color, size) {
  ctx.beginPath()

  ctx.fillStyle = color

  drawCircle(ctx, position, size)
  ctx.fill()
  ctx.closePath()
}

export function drawCircle (ctx, position, r) {
  ctx.beginPath()
  ctx.arc(position.x, position.y, r, 0, 2 * Math.PI, false)
  ctx.closePath()
}

export function drawStraightArrow(ctx, sourcePoint, targetPoint) {
  drawStraightLine(ctx, sourcePoint, targetPoint)
}

function drawStraightLine(ctx, sourcePoint, targetPoint) {
  const arrowVector = new Vector(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y)
  const unitVector = arrowVector.unit()
  const sourceBorderPoint = sourcePoint.translate(unitVector.scale(defaultNodeRadius))
  const targetBorderPoint = targetPoint.translate(unitVector.invert().scale(defaultNewNodeRadius))

  ctx.beginPath()
  ctx.moveTo(sourceBorderPoint.x, sourceBorderPoint.y)
  ctx.lineTo(targetBorderPoint.x, targetBorderPoint.y)
  ctx.stroke()

  drawArrowHead(ctx, sourceBorderPoint, targetBorderPoint)
}

function drawArrowHead(ctx, sourcePoint, targetPoint) {
  const arrowPoints = getArrowPoints(sourcePoint, targetPoint)
  drawTriangle(ctx, arrowPoints)
}

function drawTriangle(ctx, points) {
  ctx.beginPath();
  ctx.fillStyle = ctx.strokeStyle
  ctx.moveTo(points[0].x, points[0].y)
  ctx.lineTo(points[1].x, points[1].y)
  ctx.lineTo(points[2].x, points[2].y)
  ctx.fill();
}

const getArrowPoints = (sourcePoint, targetPoint) => {
  const arrowVector = new Vector(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y)
  const unitVector = arrowVector.unit()
  const perpendicular1 = unitVector.perpendicular()
  const perpendicular2 = perpendicular1.invert()

  const arrowCrossPoint = targetPoint.translate(unitVector.invert().scale(arrowLength))
  const leftPoint = arrowCrossPoint.translate(perpendicular1.scale(arrowWidth))
  const rightPoint = arrowCrossPoint.translate(perpendicular2.scale(arrowWidth))

  return [targetPoint, leftPoint, rightPoint]
}

export const drawTextLine = (ctx, line, position) => {
  let lineWidth = ctx.measureText(line).width
  let xPos = -lineWidth / 2
  ctx.fillText(line, position.x + xPos, position.y)
  return {lineWidth, xPos};
}
