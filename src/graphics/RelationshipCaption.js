export class RelationshipCaption {
  constructor(text, arrow, style, textMeasurement) {
    this.text = text
    this.orientation = style('type-orientation')
    this.padding = style('type-padding')
    this.borderWidth = style('type-border-width')
    this.fontColor = style('type-color')
    this.borderColor = style('type-border-color')
    this.backgroundColor = style('type-background-color')
    this.midPoint = arrow.midPoint()
    this.textAngle = this.orientation === 'horizontal' ? 0 : arrow.shaftAngle()
    if (this.textAngle > Math.PI / 2 || this.textAngle < -Math.PI / 2) this.textAngle += Math.PI
    this.font = {
      fontWeight: 'normal',
      fontSize: style('type-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.textWidth = textMeasurement.measureText(text).width
  }

  draw(ctx) {
    if (this.text) {
      ctx.save()
      ctx.translate(this.midPoint.x, this.midPoint.y)
      ctx.rotate(this.textAngle)
      const x = this.textWidth / 2 + this.padding + this.borderWidth / 2
      const y = this.font.fontSize / 2 + this.padding + this.borderWidth / 2
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
      ctx.font = this.font
      ctx.fillStyle = this.fontColor
      ctx.fillText(this.text, -this.textWidth / 2, 0)
      ctx.restore()
    }
  }
}