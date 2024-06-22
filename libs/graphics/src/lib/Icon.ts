import { StyleFunction } from '@neo4j-arrows/model';
import { ImageInfo, isImageInfoLoaded } from './utils/ImageCache';
import { getCachedImage } from './utils/ImageCache';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class Icon {
  iconImage: string;
  imageInfo: ImageInfo;
  width: number;
  height: number;

  constructor(
    imageKey: string,
    style: StyleFunction,
    imageCache: Record<string, ImageInfo>
  ) {
    this.iconImage = style(imageKey) as string;
    const iconSize = style('icon-size') as number;
    this.imageInfo = getCachedImage(imageCache, this.iconImage);
    if (this.imageInfo.width === 0 || this.imageInfo.height === 0) {
      this.width = this.height = iconSize;
    } else {
      const largestDimension =
        this.imageInfo.width > this.imageInfo.height ? 'width' : 'height';
      this.width =
        largestDimension === 'width'
          ? iconSize
          : (iconSize * this.imageInfo.width) / this.imageInfo.height;
      this.height =
        largestDimension === 'height'
          ? iconSize
          : (iconSize * this.imageInfo.height) / this.imageInfo.width;
    }
  }

  draw(ctx: DrawingContext, x: number, y: number) {
    if (isImageInfoLoaded(this.imageInfo)) {
      ctx.image(this.imageInfo, x, y, this.width, this.height);
    }
  }
}
