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
  drawArrowEndpoint(ctx, x, y, arrowData.angle, length, -0.1)

  ctx.fill()
}

export function drawStraightLine(ctx, sourcePoint, targetPoint) {
  ctx.beginPath()
  ctx.moveTo(sourcePoint.x, sourcePoint.y)
  ctx.lineTo(targetPoint.x, targetPoint.y)
  ctx.stroke()
  ctx.closePath()
}

export const drawTextLine = (ctx, line, position) => {
  let lineWidth = ctx.measureText(line).width
  let xPos = -lineWidth / 2
  ctx.fillText(line, position.x + xPos, position.y)
  return {lineWidth, xPos};
}

export const drawArrowEndpoint = (ctx, xTo, yTo, angle, length, shiftRatio) => {
  ctx.fillStyle = ctx.strokeStyle

  const pixelRatio = (window.devicePixelRatio || 1)
  ctx.lineWidth *= pixelRatio

  let x = shiftRatio ? xTo + Math.cos(angle) * length * shiftRatio : xTo
  let y = shiftRatio ? yTo + Math.sin(angle) * length * shiftRatio : yTo

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

export const drawPolygon = (ctx, points, color) => {
  ctx.fillStyle = color || 'none'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  points.forEach(point => ctx.lineTo(point.x, point.y))
  ctx.closePath()
  ctx.fill()
}