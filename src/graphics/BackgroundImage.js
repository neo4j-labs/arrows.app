import {getCachedImage} from "./utils/ImageCache";

export class BackgroundImage {
  constructor(style, imageCache) {
    const backgroundImageUrl = style['background-image']
    if (!!backgroundImageUrl) {
      const backgroundSize = parseFloat(style['background-size']) / 100
      this.imageInfo = getCachedImage(imageCache, backgroundImageUrl)
      this.width = this.imageInfo.width * backgroundSize
      this.height = this.imageInfo.height * backgroundSize
    }
  }

  draw(ctx, displayOptions) {
    if (!!this.imageInfo) {
      ctx.save()
      const viewTransformation = displayOptions.viewTransformation
      ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy)
      ctx.scale(viewTransformation.scale)
      ctx.image(this.imageInfo, -this.width / 2, -this.height / 2, this.width, this.height)
      ctx.restore()
    }
  }
}