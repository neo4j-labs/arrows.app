export class NodeBackground {
  constructor(style) {
    this.backgroundColor = style('node-color')
  }

  draw(position, radius, ctx) {
    ctx.save()

    ctx.fillStyle = this.backgroundColor
    ctx.circle(position.x, position.y, radius, true, false)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}