import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DisplayOptions } from './utils/DisplayOptions';
import { DrawingContext } from './utils/DrawingContext';
import { ImageInfo, getCachedImage } from './utils/ImageCache';

export class BackgroundImage {
  imageInfo?: ImageInfo;
  width: number;
  height: number;
  constructor(
    style: Record<string, string>,
    imageCache: Record<string, ImageInfo>
  ) {
    const backgroundImageUrl = style['background-image'];
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!backgroundImageUrl) {
      const backgroundSize = parseFloat(style['background-size']) / 100;
      this.imageInfo = getCachedImage(imageCache, backgroundImageUrl);
      this.width = this.imageInfo.width * backgroundSize;
      this.height = this.imageInfo.height * backgroundSize;
    } else {
      this.imageInfo = undefined;
      this.width = 0;
      this.height = 0;
    }
  }

  draw(ctx: DrawingContext, displayOptions: DisplayOptions) {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!this.imageInfo) {
      ctx.save();
      const viewTransformation = displayOptions.viewTransformation;
      ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy);
      ctx.scale(viewTransformation.scale);
      ctx.image(
        this.imageInfo,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.restore();
    }
  }
}
