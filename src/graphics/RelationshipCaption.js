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
    const textWidth = textMeasurement.measureText(text).width
    this.width = textWidth + this.padding * 2 + this.borderWidth
    this.height = this.font.fontSize + this.padding * 2 + this.borderWidth
    this.offset = this.orientation === 'above' ? -this.height / 2 : 0
  }

  draw(ctx) {
    if (this.text) {
      ctx.save()
      ctx.translate(this.midPoint.x, this.midPoint.y)
      ctx.rotate(this.textAngle)
      ctx.translate(0, this.offset)
      ctx.fillStyle = this.backgroundColor
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      if (this.orientation !== 'above') {
        ctx.rect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height,
          this.padding,
          true,
          this.borderWidth > 0
        )
      }
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.font = this.font
      ctx.fillStyle = this.fontColor
      ctx.fillText(this.text, 0, 0)
      ctx.restore()
    }
  }
}