import BoundingBox from "./utils/BoundingBox";

export class NodeIconInside {
  constructor(imageKey, editing, style, imageCache) {
    this.editing = editing
    this.orientation = { horizontal: 'center', vertical: 'center' }
    this.iconImage = style(imageKey)
    this.imageCache = imageCache;
    this.image = this.imageCache[this.iconImage]
    this.width = this.image.width
    this.height = this.image.height
  }

  get type() {
    return 'ICON'
  }

  draw(ctx) {
    if (this.editing) return

    ctx.save()

    const x = -Math.floor(this.width / 2)
    const y = 0
    ctx.image(this.image, x, y)

    ctx.restore()
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