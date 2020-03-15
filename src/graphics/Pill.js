import BoundingBox from "./utils/BoundingBox";

export default class Pill {
  constructor(text, position, width, radius, borderWidth, backgroundColor, strokeColor, fontColor) {
    this.text = text
    this.position = position
    this.width = width
    this.radius = radius
    this.borderWidth = borderWidth
    this.backgroundColor = backgroundColor
    this.strokeColor = strokeColor
    this.fontColor = fontColor
  }
  
  draw(ctx) {
    ctx.save()
    ctx.translate(...this.position.xy)
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = this.borderWidth
    ctx.rect(0, 0, this.width + this.radius * 2, this.radius * 2, this.radius, true, this.borderWidth > 0)
    ctx.fillStyle = this.fontColor
    ctx.fillText(this.text, this.radius, this.radius)
    ctx.restore()
  }

  boundingBox() {
    return new BoundingBox(
      this.position.x - this.borderWidth / 2,
      this.position.x + this.width + this.radius * 2 + this.borderWidth / 2,
      this.position.y - this.borderWidth / 2,
      this.position.y + this.radius * 2 + this.borderWidth / 2
    )
  }
}