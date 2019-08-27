import {drawCircle} from "./canvasRenderer";

export class NodeBorder {
  constructor(style) {
    this.borderWidth = style('border-width')
    this.borderColor = style('border-color')
  }

  draw(position, radius, ctx) {
    ctx.save()

    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = this.borderWidth
    drawCircle(ctx, position, Math.max(this.borderWidth / 2, radius - this.borderWidth / 2), true)

    ctx.restore()
  }
}