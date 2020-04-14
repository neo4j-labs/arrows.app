export class NodeBackground {
  constructor(style) {
    this.backgroundColor = style('node-color')
    this.borderWidth = style('border-width')
    this.borderColor = style('border-color')
  }

  draw(position, radius, ctx) {
    ctx.save()

    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = this.borderWidth
    ctx.circle(position.x, position.y, radius, true, this.borderWidth > 0)
    ctx.restore()
  }
}