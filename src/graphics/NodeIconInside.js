import BoundingBox from "./utils/BoundingBox";

export class NodeIconInside {
  constructor(editing, style, imageCache) {
    this.editing = editing
    this.orientation = { horizontal: 'center', vertical: 'center' }
    this.iconImage = style('icon-image')
    this.imageCache = imageCache;
    this.image = this.imageCache.getCanvas(this.iconImage)
  }

  get type() {
    return 'ICON'
  }

  draw(ctx) {
    if (this.editing) return

    ctx.save()

    const x = -1 * Math.floor(this.image.width / 2)
    const y = -1 * Math.floor(this.image.height / 2)
    ctx.image(this.image, x, y)

    ctx.restore()
  }

  get contentsFit() {
    return true
  }

  boundingBox() {
    return new BoundingBox(
      -this.image.width / 2,
      this.image.width / 2,
      -this.image.height / 2,
      this.image.height / 2
    )
  }

  distanceFrom(point) {
    return point.vectorFromOrigin().distance()
  }
}