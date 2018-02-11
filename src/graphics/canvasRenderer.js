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

export function drawStraightArrow(ctx, sourcePoint, targetPoint, arrowData) {
  drawStraightLine(ctx, sourcePoint, targetPoint)

  let length = arrowData.length
  let x = arrowData.point.x
  let y = arrowData.point.y

  // draw arrow at the end of the line
  drawArrowEndpoint(ctx, x, y, arrowData.angle, length)

  ctx.fill()
}

export function drawStraightLine(ctx, sourcePoint, targetPoint) {
  ctx.beginPath()
  ctx.moveTo(sourcePoint.x, sourcePoint.y)
  ctx.lineTo(targetPoint.x, targetPoint.y)
  ctx.stroke()
  ctx.closePath()
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

export const drawArrowEndpoint = (ctx, x, y, angle, length) => {
  ctx.fillStyle = ctx.strokeStyle

  const pixelRatio = (window.devicePixelRatio || 1)
  ctx.lineWidth *= pixelRatio

  // tail
  var xt = x - length * Math.cos(angle)
  var yt = y - length * Math.sin(angle)

  // inner tail
  var xi = x - length * 0.9 * Math.cos(angle)
  var yi = y - length * 0.9 * Math.sin(angle)

  // left
  var xl = xt + length / 3 * Math.cos(angle + 0.5 * Math.PI)
  var yl = yt + length / 3 * Math.sin(angle + 0.5 * Math.PI)

  // right
  var xr = xt + length / 3 * Math.cos(angle - 0.5 * Math.PI)
  var yr = yt + length / 3 * Math.sin(angle - 0.5 * Math.PI)

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(xl, yl)
  ctx.lineTo(xi, yi)
  ctx.lineTo(xr, yr)
  ctx.closePath()

  ctx.lineWidth /= pixelRatio
}