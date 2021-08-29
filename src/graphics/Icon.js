export class Icon {
  constructor(imageKey, style, imageCache) {
    this.iconImage = style(imageKey)
    const iconSize = style('icon-size')
    this.imageInfo = imageCache[this.iconImage]
    const largestDimension = this.imageInfo.width > this.imageInfo.height ? 'width' : 'height'
    this.width = largestDimension === 'width' ? iconSize : iconSize * this.imageInfo.width / this.imageInfo.height
    this.height = largestDimension === 'height' ? iconSize : iconSize * this.imageInfo.height / this.imageInfo.width
  }

  draw(ctx, x, y) {
    ctx.image(this.imageInfo, x, y, this.width, this.height)
  }
}