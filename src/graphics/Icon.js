export class Icon {
  constructor(imageKey, style, imageCache) {
    this.iconImage = style(imageKey)
    this.image = imageCache[this.iconImage]
    this.width = this.image.width
    this.height = this.image.height
  }

  draw(ctx, x, y) {
    ctx.image(this.image, x, y)
  }
}