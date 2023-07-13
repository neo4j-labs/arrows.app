import {Point} from "../model-old/Point";
import BoundingBox from "./utils/BoundingBox";
import {selectionBorder, selectionHandle} from "../model-old/colors";
import {Icon} from "./Icon";
import {adaptForBackground} from "./backgroundColorAdaption";

export class IconOutside {
  constructor(imageKey, orientation, editing, style, imageCache) {
    this.orientation = orientation
    this.editing = editing
    this.icon = new Icon(imageKey, style, imageCache)
    this.width = this.icon.width
    this.height = this.icon.height
    const horizontalPosition = (() => {
      switch (orientation.horizontal) {
        case 'start':
          return 0
        case 'center':
          return -this.width / 2
        case 'end':
          return -this.width
      }
    })()
    this.boxPosition = new Point(horizontalPosition, 0)
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
  }

  get type() {
    return 'ICON'
  }

  draw(ctx) {
    if (this.editing) return

    this.icon.draw(ctx, this.boxPosition.x, this.boxPosition.y)
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    const boundingBox = this.boundingBox()
    ctx.save()
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true)
    ctx.restore()
  }

  get contentsFit() {
    return true
  }

  boundingBox() {
    const left = this.boxPosition.x
    const top = this.boxPosition.y

    return new BoundingBox(left, left + this.width, top, top + this.height)
  }

  distanceFrom(point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}