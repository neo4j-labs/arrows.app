export default class BoundingBox {
  constructor(left, right, top, bottom) {
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
  }

  get width() {
    return this.right - this.left
  }

  get height() {
    return this.bottom - this.top
  }

  combine(other) {
    return new BoundingBox(
      Math.min(this.left, other.left),
      Math.max(this.right, other.right),
      Math.min(this.top, other.top),
      Math.max(this.bottom, other.bottom)
    )
  }

  scale(scaleFactor) {
    return new BoundingBox(
      this.left * scaleFactor,
      this.right * scaleFactor,
      this.top * scaleFactor,
      this.bottom * scaleFactor
    )
  }

  translate(vector) {
    return new BoundingBox(
      this.left + vector.dx,
      this.right + vector.dx,
      this.top + vector.dy,
      this.bottom + vector.dy
    )
  }

  contains(point) {
    return (
      point.x >= this.left && point.x <= this.right &&
      point.y >= this.top && point.y <= this.bottom
    )
  }
}

export const combineBoundingBoxes = (boundingBoxes) => {
  return boundingBoxes.reduce((accumulator, value) => accumulator ? accumulator.combine(value) : value, null)
}