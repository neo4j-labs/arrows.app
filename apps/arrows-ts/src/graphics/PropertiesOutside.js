import { Point } from '../model/Point';
import { PropertiesBox } from './PropertiesBox';

export class PropertiesOutside {
  constructor(properties, orientation, editing, style, textMeasurement) {
    this.propertiesBox = new PropertiesBox(
      properties,
      editing,
      style,
      textMeasurement
    );
    this.width = this.propertiesBox.boxWidth;
    this.height = this.propertiesBox.boxHeight;
    const horizontalPosition = (() => {
      switch (orientation.horizontal) {
        case 'start':
          return 0;
        case 'center':
          return -this.width / 2;
        case 'end':
          return -this.width;
      }
    })();
    this.boxPosition = new Point(horizontalPosition, 0);
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
      this.propertiesBox.drawBackground(ctx);
      this.propertiesBox.draw(ctx);

      ctx.restore();
    }
  }

  drawSelectionIndicator(ctx) {
    ctx.save();
    ctx.translate(...this.boxPosition.xy);
    this.propertiesBox.drawSelectionIndicator(ctx);
    ctx.restore();
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
