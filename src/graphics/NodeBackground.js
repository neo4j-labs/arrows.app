import {selectionBorder, selectionHandle} from "../model/colors";

export class NodeBackground {
  constructor(position, internalRadius, editing, style) {
    this.position = position;
    this.internalRadius = internalRadius;
    this.editing = editing
    this.backgroundColor = style('node-color')
    this.borderWidth = style('border-width')
    this.borderColor = style('border-color')
  }

  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = this.borderWidth
    ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth / 2, true, this.borderWidth > 0)
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    ctx.save()
    const indicatorWidth = 10
    ctx.strokeStyle = this.editing ? selectionHandle : selectionBorder
    ctx.lineWidth = indicatorWidth
    ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth, false, true)
    ctx.restore()
  }
}