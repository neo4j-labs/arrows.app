import {selectionBorder, selectionHandle} from "../model-old/colors";
import {getCachedImage} from "./utils/ImageCache";
import {adaptForBackground} from "./backgroundColorAdaption";

export class NodeBackground {
  constructor(position, internalRadius, editing, style, imageCache) {
    this.position = position;
    this.internalRadius = internalRadius;
    this.editing = editing
    this.backgroundColor = style('node-color')
    this.borderWidth = style('border-width')
    this.borderColor = style('border-color')
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    const backgroundImageUrl = style('node-background-image')
    if (!!backgroundImageUrl) {
      this.imageInfo = getCachedImage(imageCache, backgroundImageUrl)
    }
  }

  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = this.borderWidth
    ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth / 2, true, this.borderWidth > 0)
    if (!!this.imageInfo) {
      ctx.imageInCircle(this.imageInfo, this.position.x, this.position.y, this.internalRadius)
    }
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    ctx.save()
    const indicatorWidth = 10
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth, false, true)
    ctx.restore()
  }
}