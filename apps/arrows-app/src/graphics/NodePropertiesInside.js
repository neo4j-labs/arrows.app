import { Point } from '../model/Point';
import { PropertiesBox } from './PropertiesBox';

export class NodePropertiesInside {
  constructor(properties, editing, style, textMeasurement) {
    this.propertiesBox = new PropertiesBox(
      properties,
      editing,
      style,
      textMeasurement
    );
    this.width = this.propertiesBox.boxWidth;
    this.height = this.propertiesBox.boxHeight;
    this.boxPosition = new Point(-this.width / 2, 0);
  }

  get type() {
    return 'PROPERTIES';
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty;
  }

  draw(ctx) {
    if (!this.isEmpty) {
      ctx.save();

      ctx.translate(...this.boxPosition.xy);
      this.propertiesBox.draw(ctx);

      ctx.restore();
    }
  }

  boundingBox() {
    return this.propertiesBox
      .boundingBox()
      .translate(this.boxPosition.vectorFromOrigin());
  }

  distanceFrom(point) {
    return this.boundingBox().contains(point) ? 0 : Infinity;
  }
}
