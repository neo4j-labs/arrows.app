import BoundingBox from "./utils/BoundingBox";
import {Icon} from "./Icon";

export class NodeIconInside {
  constructor(imageKey, editing, style, imageCache) {
    this.editing = editing
    this.orientation = { horizontal: 'center', vertical: 'center' }
    this.icon = new Icon(imageKey, style, imageCache)
    this.width = this.icon.width
    this.height = this.icon.height
  }

  get type() {
    return 'ICON'
  }

  draw(ctx) {
    if (this.editing) return

    const x = -this.width / 2
    const y = 0
    this.icon.draw(ctx, x, y)
  }

  get contentsFit() {
    return true
  }

  boundingBox() {
    return new BoundingBox(
      -this.width / 2,
      this.width / 2,
      0,
      this.height
    )
  }

  distanceFrom(point) {
    return point.vectorFromOrigin().distance()
  }
}