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

  scale(x, y) {
    this.ctx.scale(x, y)
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

  set lineWidth(value) {
    this.ctx.lineWidth = value
  }

  set lineJoin(value) {
    this.ctx.lineJoin = value
  }

  set strokeStyle(value) {
    this.ctx.strokeStyle = value
  }
}