export class Icon {
  constructor(imageKey, style, imageCache) {
    this.iconImage = style(imageKey)
    const iconSize = style('icon-size')
    this.image = imageCache[this.iconImage]
    const largestDimension = this.image.width > this.image.height ? 'width' : 'height'
    this.width = largestDimension === 'width' ? iconSize : iconSize * this.image.width / this.image.height
    this.height = largestDimension === 'height' ? iconSize : iconSize * this.image.height / this.image.width
  }

  draw(ctx, x, y) {
    ctx.image(this.image, x, y, this.width, this.height)
  }
}