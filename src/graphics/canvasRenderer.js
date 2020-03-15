import { red } from "../model/colors"

const dashColor = red

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

export function drawCircle (ctx, position, r, stroke = false, options = { dashed: false }) {
  ctx.beginPath()

  const strokeStyle = ctx.strokeStyle
  if(options.dashed) {
    ctx.setLineDash([5, 10])
    ctx.strokeStyle = dashColor
  }

  ctx.arc(position.x, position.y, r, 0, 2 * Math.PI, false)
  stroke && ctx.stroke()
  ctx.closePath()

  if(options.dashed) {
    ctx.setLineDash([])
    ctx.strokeStyle = strokeStyle
  }
}

export function drawSolidRectangle(ctx, topLeft, width, height, radius, color) {
  const x = topLeft.x
  const y = topLeft.y
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.fill()
  ctx.closePath()
}

export function drawStraightLine(ctx, sourcePoint, targetPoint, options = { dashed: false }) {
  ctx.beginPath()

  const strokeStyle = ctx.strokeStyle
  if(options.dashed) {
    ctx.setLineDash([5, 10])
    ctx.strokeStyle = dashColor
  }

  ctx.moveTo(sourcePoint.x, sourcePoint.y)
  ctx.lineTo(targetPoint.x, targetPoint.y)
  ctx.stroke()
  ctx.closePath()

  if(options.dashed) {
    ctx.setLineDash([])
    ctx.strokeStyle = strokeStyle
  }
}

export const drawTextLine = (ctx, line, position, alignment) => {
  ctx.textAlign = alignment
  ctx.fillText(line, position.x, position.y)
}

export const drawPolygon = (ctx, points, fill, stroke) => {
  if (points.length < 3) {
    return
  }
  ctx.fillStyle = fill || 'none'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  points.forEach(point => {
    ctx.lineTo(point.x, point.y)
    stroke && ctx.stroke()
  })
  ctx.closePath()
  fill && ctx.fill()
}