export default class BoundingBox {
  constructor(left, right, top, bottom) {
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
  }

  combine(other) {
    return new BoundingBox(
      Math.min(this.left, other.left),
      Math.max(this.right, other.right),
      Math.min(this.top, other.top),
      Math.max(this.bottom, other.bottom)
    )
  }
}