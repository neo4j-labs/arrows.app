export class RelationshipCaption {
  constructor(text, fontSize, padding, borderWidth) {
    this.text = text
    this.fontSize = fontSize
    this.padding = padding
    this.borderWidth = borderWidth
  }

  draw(arrow, ctx) {
    console.log(arrow.shaftAngle())
    ctx.save()
    const midPoint = arrow.midPoint();
    ctx.translate(midPoint.x, midPoint.y)
    let textAngle = arrow.shaftAngle()
    if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) textAngle += Math.PI
    ctx.rotate(textAngle)
    ctx.font = this.fontSize + 'px sans-serif'
    const metrics = ctx.measureText(this.text)
    const x = metrics.width / 2 + this.padding
    const y = this.fontSize / 2 + this.padding
    ctx.beginPath()
    ctx.moveTo(-x, 0)
    ctx.arcTo(-x, y, 0, y, this.padding)
    ctx.arcTo(x, y, x, 0, this.padding)
    ctx.arcTo(x, -y, 0, -y, this.padding)
    ctx.arcTo(-x, -y, -x, 0, this.padding)
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.strokeStyle = arrow.arrowColor
    ctx.lineWidth = this.borderWidth
    ctx.fill()
    ctx.stroke()
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'black'
    ctx.fillText(this.text, -metrics.width / 2, 0)
    ctx.restore()
  }
}