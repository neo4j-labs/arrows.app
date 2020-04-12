export class RelationshipCaption {
  constructor(text, style) {
    this.text = text
    this.orientation = style('type-orientation')
    this.fontSize = style('type-font-size')
    this.padding = style('type-padding')
    this.borderWidth = style('type-border-width')
    this.fontColor = style('type-color')
    this.borderColor = style('type-border-color')
    this.backgroundColor = style('type-background-color')
  }

  draw(arrow, ctx) {
    ctx.save()
    const midPoint = arrow.midPoint();
    ctx.translate(midPoint.x, midPoint.y)
    let textAngle = this.orientation === 'horizontal' ? 0 : arrow.shaftAngle()
    if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) textAngle += Math.PI
    ctx.rotate(textAngle)
    ctx.font = {
      fontWeight: 'normal',
      fontSize: this.fontSize,
      fontFace: 'sans-serif'
    }
    const metrics = ctx.measureText(this.text)
    const x = metrics.width / 2 + this.padding + this.borderWidth / 2
    const y = this.fontSize / 2 + this.padding + this.borderWidth / 2
    if (this.orientation === 'above') {
      ctx.translate(0, -y)
    }
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = this.borderWidth
    if (this.orientation !== 'above') {
      ctx.rect(-x, -y, 2 * x, 2 * y, this.padding, true, this.borderWidth > 0)
    }
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.fontColor
    ctx.fillText(this.text, -metrics.width / 2, 0)
    ctx.restore()
  }
}