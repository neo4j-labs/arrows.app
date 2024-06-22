import { BoundingBox } from './utils/BoundingBox';
import { Icon } from './Icon';
import { Point, StyleFunction } from '@neo4j-arrows/model';
import { DrawableComponent } from './DrawableComponent';
import { TextOrientation } from './circumferentialTextAlignment';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { ImageInfo } from './utils/ImageCache';
import { DrawingContext } from './utils/DrawingContext';

export class NodeIconInside implements DrawableComponent {
  editing: boolean;
  orientation: TextOrientation;
  icon: Icon;
  width: number;
  height: number;

  constructor(
    imageKey: string,
    editing: boolean,
    style: StyleFunction,
    imageCache: Record<string, ImageInfo>
  ) {
    this.editing = editing;
    this.orientation = { horizontal: 'center', vertical: 'center' };
    this.icon = new Icon(imageKey, style, imageCache);
    this.width = this.icon.width;
    this.height = this.icon.height;
  }

  get type() {
    return 'ICON';
  }

  draw(ctx: DrawingContext) {
    if (this.editing) return;

    const x = -this.width / 2;
    const y = 0;
    this.icon.draw(ctx, x, y);
  }

  get contentsFit() {
    return true;
  }

  boundingBox() {
    return new BoundingBox(-this.width / 2, this.width / 2, 0, this.height);
  }

  distanceFrom(point: Point) {
    return point.vectorFromOrigin().distance();
  }
}
