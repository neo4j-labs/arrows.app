import {Vector} from "../model/Vector";
import { arrowLength, arrowWidth } from "./constants";

export function drawRing(ctx, position, color, size) {
  drawSolidCircle(ctx, position, color, size)
}

export function drawSolidCircle (ctx, position, color, size) {
  ctx.beginPath()
  ctx.fillStyle = color
  drawCircle(ctx, position, size)
  ctx.fill()
  ctx.closePath()
}

export function drawCircle (ctx, position, r, stroke = false) {
  ctx.beginPath()
  ctx.arc(position.x, position.y, r, 0, 2 * Math.PI, false)
  stroke && ctx.stroke()
  ctx.closePath()
}

export function drawStraightArrow(ctx, sourcePoint, targetPoint) {
  drawStraightLine(ctx, sourcePoint, targetPoint)
}

export function drawStraightLine(ctx, sourcePoint, targetPoint) {
  ctx.beginPath()
  ctx.moveTo(sourcePoint.x, sourcePoint.y)
  ctx.lineTo(targetPoint.x, targetPoint.y)
  ctx.stroke()
  ctx.closePath()

  drawArrowHead(ctx, sourcePoint, targetPoint)
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
  ctx.closePath()
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
