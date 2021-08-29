export default class CanvasAdaptor {
  constructor(ctx) {
    this.ctx = ctx
  }

  save() {
    this.ctx.save()
  }

  restore() {
    this.ctx.restore()
  }

  translate(dx, dy) {
    this.ctx.translate(dx, dy)
  }

  scale(x) {
    this.ctx.scale(x, x)
  }

  rotate(angle) {
    this.ctx.rotate(angle)
  }

  beginPath() {
    this.ctx.beginPath()
  }

  closePath() {
    this.ctx.closePath()
  }

  moveTo(x, y) {
    this.ctx.moveTo(x, y)
  }


  lineTo(x, y) {
    this.ctx.lineTo(x, y)
  }

  arcTo(x1, y1, x2, y2, radius) {
    this.ctx.arcTo(x1, y1, x2, y2, radius)
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  }

  circle(x, y, radius, fill, stroke) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2, false)
    this.ctx.closePath()
    if (fill) this.ctx.fill()
    if (stroke) this.ctx.stroke()
  }

  rect(x, y, width, height, r, fill, stroke) {
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + r)
    this.ctx.arc(x + r, y + r, r, -Math.PI, -Math.PI / 2)
    this.ctx.lineTo(x + width - r, y)
    this.ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0)
    this.ctx.lineTo(x + width, y + height - r)
    this.ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
    this.ctx.lineTo(x + r, y + height)
    this.ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
    this.ctx.closePath()
    if (fill) this.ctx.fill()
    if (stroke) this.ctx.stroke()
  }

  image(imageInfo, x, y, width, height) {
    this.ctx.drawImage(imageInfo.image, x, y, width, height)
  }

  polyLine(points) {
    this.ctx.beginPath()
    if (points.length > 0) {
      const startPoint = points[0]
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }
    this.ctx.stroke()
  }

  polygon(points, fill, stroke) {
    this.ctx.beginPath()
    if (points.length > 0) {
      const startPoint = points[0]
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }
    this.ctx.closePath()
    if (fill) this.ctx.fill()
    if (stroke) this.ctx.stroke()
  }

  stroke() {
    this.ctx.stroke()
  }

  fill() {
    this.ctx.fill()
  }

  fillText(text, x, y) {
    this.ctx.fillText(text, x, y)
  }

  measureText(text) {
    return this.ctx.measureText(text)
  }

  setLineDash(dash) {
    this.ctx.setLineDash(dash)
  }

  set fillStyle(color) {
    this.ctx.fillStyle = color
  }

  set font(style) {
    this.ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFace}`
  }

  set textBaseline(value) {
    this.ctx.textBaseline = value
  }

  set textAlign(value) {
    this.ctx.textAlign = value
  }

  set lineWidth(value) {
    this.ctx.lineWidth = value
  }

  set lineJoin(value) {
    this.ctx.lineJoin = value
  }

  set lineCap(value) {
    this.ctx.lineCap = value
  }

  set strokeStyle(value) {
    this.ctx.strokeStyle = value
  }
}