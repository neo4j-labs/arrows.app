export function drawNode(ctx, x, y, color, size) {
  drawSolidCircle(ctx, x, y, color, size)
}

function drawSolidCircle (ctx, x, y, color, size) {
  ctx.beginPath()

  ctx.fillStyle = color

  drawCircle(ctx, x, y, size)
  ctx.fill()
  ctx.closePath()
}

function drawCircle (ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI, false)
  ctx.closePath()
}
