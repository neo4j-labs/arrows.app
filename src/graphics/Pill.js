import BoundingBox from "./utils/BoundingBox";
import {green} from "../model/colors";
import {Point} from "../model/Point";

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

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.translate(...this.position.xy)
    ctx.strokeStyle = green
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(
      -this.borderWidth / 2, -this.borderWidth / 2,
      this.width + this.radius * 2 + this.borderWidth, this.radius * 2 + this.borderWidth,
      this.radius + this.borderWidth / 2, false, true
    )
    ctx.restore()
  }

  contains(point) {
    const translated = point.translate(this.position.vectorFromOrigin().invert())
    const rectangle = new BoundingBox(this.radius, this.radius + this.width, 0, this.radius * 2)
    const leftCenter = new Point(this.radius, this.radius)
    const rightCenter = new Point(this.radius + this.width, this.radius)
    return rectangle.contains(translated) ||
      leftCenter.vectorFrom(translated).distance() < this.radius ||
      rightCenter.vectorFrom(translated).distance() < this.radius
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