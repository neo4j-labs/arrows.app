// creates a polygon for an arrow head facing right, with its point at the origin.
export default function arrowHead(ctx, headHeight, chinHeight, headWidth, fill, stroke) {
  ctx.polygon([
    {x: chinHeight - headHeight, y: 0},
    {x: -headHeight, y: headWidth / 2},
    {x: 0, y: 0},
    {x: -headHeight, y: -headWidth / 2}
  ], fill, stroke)
}