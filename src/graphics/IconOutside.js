import {Point} from "../model/Point";
import BoundingBox from "./utils/BoundingBox";
import {selectionBorder, selectionHandle} from "../model/colors";

export class IconOutside {
  constructor(imageKey, orientation, editing, style, imageCache) {
    this.orientation = orientation
    this.editing = editing
    this.iconImage = style(imageKey)
    this.imageCache = imageCache;
    this.image = this.imageCache[this.iconImage]
    this.width = this.image.width
    this.height = this.image.height
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
  }

  get type() {
    return 'ICON'
  }

  draw(ctx) {
    if (this.editing) return

    ctx.save()

    ctx.image(this.image, this.boxPosition.x, this.boxPosition.y)

    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    const boundingBox = this.boundingBox()
    ctx.save()
    ctx.strokeStyle = this.editing ? selectionHandle : selectionBorder
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