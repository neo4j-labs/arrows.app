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
    let textAngle = this.orientation === 'inline' ? arrow.shaftAngle() : 0
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
    ctx.beginPath()
    ctx.moveTo(-x, 0)
    ctx.arcTo(-x, y, 0, y, this.padding)
    ctx.arcTo(x, y, x, 0, this.padding)
    ctx.arcTo(x, -y, 0, -y, this.padding)
    ctx.arcTo(-x, -y, -x, 0, this.padding)
    ctx.closePath()
    ctx.fillStyle = this.backgroundColor
    ctx.fill()
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      ctx.stroke()
    }
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.fontColor
    ctx.fillText(this.text, -metrics.width / 2, 0)
    ctx.restore()
  }
}