// creates a path for the outline of an arrow head facing right, with its point at the origin.
export default function arrowHead(ctx, headHeight, chinHeight, headWidth) {
  ctx.beginPath()
  ctx.moveTo(chinHeight - headHeight, 0)
  ctx.lineTo(-headHeight, headWidth / 2)
  ctx.lineTo(0, 0)
  ctx.lineTo(-headHeight, -headWidth / 2)
  ctx.closePath()
}