export class NodeBackground {
  constructor(style) {
    this.backgroundColor = style('node-color')
  }

  draw(position, radius, ctx) {
    ctx.save()

    ctx.fillStyle = this.backgroundColor
    ctx.beginPath()
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}