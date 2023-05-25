export class Size {
  constructor(width, height) {
    this.width = width
    this.height = height
  }

  relative(dWidth, dHeight) {
    return new Size(this.width + dWidth, this.height + dHeight)
  }
}
