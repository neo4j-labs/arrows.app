export function drawNode(ctx, position, color, size) {
  drawSolidCircle(ctx, position, color, size)
}

function drawSolidCircle (ctx, position, color, size) {
  ctx.beginPath()

  ctx.fillStyle = color

  drawCircle(ctx, position, size)
  ctx.fill()
  ctx.closePath()
}

function drawCircle (ctx, position, r) {
  ctx.beginPath()
  ctx.arc(position.x, position.y, r, 0, 2 * Math.PI, false)
  ctx.closePath()
}
