export function drawDashedCircle(ctx, position, radius, color) {
  ctx.save()

  ctx.setLineDash([5, 10])
  ctx.strokeStyle = color

  ctx.beginPath()
  ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false)
  ctx.closePath()
  ctx.stroke()

  ctx.restore()
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

export function drawDashedLine(ctx, sourcePoint, targetPoint, color) {
  ctx.save()

  ctx.beginPath()
  ctx.setLineDash([5, 10])
  ctx.strokeStyle = color

  ctx.moveTo(sourcePoint.x, sourcePoint.y)
  ctx.lineTo(targetPoint.x, targetPoint.y)
  ctx.closePath()
  ctx.stroke()

  ctx.restore()
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